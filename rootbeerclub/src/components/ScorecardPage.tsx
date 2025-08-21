import { useState, useEffect } from 'react';
import { useUser } from './UserContext';

interface RootBeer {
  rootbeer_id: number;
  name: string;
}

interface ScorecardData {
  rootBeerId: number | null;
  notes: string;
  overallRating: number;
}

interface UserWithId {
  user_id: number;
  firstname: string;
  lastname: string;
}

const ScorecardPage = () => {
  const { user } = useUser() as { user: UserWithId | null };
const [scorecardData, setScorecardData] = useState<ScorecardData>({
  rootBeerId: null,
  notes: '',
  overallRating: 0
});
const [isRootbeer, setIsRootbeer] = useState(true);
  const [rootbeers, setRootbeers] = useState<RootBeer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Removed unused loadingRootbeers
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Only one criteria now, so we don't need the array or interface

  const handleScoreChange = (score: number) => {
    setScorecardData({
      ...scorecardData,
      overallRating: score
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!user || typeof user.user_id !== 'number') {
      setSubmitError('You must be logged in to submit a rating.');
      return;
    }
    if (!scorecardData.rootBeerId) {
      setSubmitError('Please select a root beer.');
      return;
    }
    if (scorecardData.overallRating < 0 || scorecardData.overallRating > 10) {
      setSubmitError('Rating must be between 0 and 10. Decimals are allowed.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootbeer_id: scorecardData.rootBeerId,
          comment: scorecardData.notes,
          rating: scorecardData.overallRating,
          user_id: user.user_id,
          is_rootbeer: isRootbeer
        })
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      alert('Scorecard submitted successfully!');
      setScorecardData({ rootBeerId: null, notes: '', overallRating: 0 });
      setSearchTerm('');
      setIsRootbeer(true);
      // setSelectedUserId(null); // No longer needed
    } catch (err: any) {
      setSubmitError(err.message || 'Unknown error');
    }
  };

  useEffect(() => {
    const fetchRootbeers = async () => {
      try {
        const res = await fetch('http://localhost:3000/rootbeers?all=true');
        const data = await res.json();
        setRootbeers(data.data); // This will now be ALL rootbeers
      } catch {
        setRootbeers([]);
      }
    };
    fetchRootbeers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl text-rootbeer-700 mb-2">Root Beer Scorecard</h1>
        <p className="text-xl text-gray-600">Rate and review your favorite root beers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl text-rootbeer-700 mb-6">Basic Information</h2>
          <div className="max-w-md mx-auto">
            {/* Judge selection removed; using logged-in user */}
            <div className="flex flex-col relative">
              <label htmlFor="rootBeerSearch" className="font-semibold mb-2 text-gray-700">Root Beer Name</label>
              <input
                id="rootBeerSearch"
                type="text"
                placeholder="Search root beers..."
                value={searchTerm}
                autoComplete="off"
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base"
              />
              {searchTerm && searchTerm !== rootbeers.find(rb => rb.rootbeer_id === scorecardData.rootBeerId)?.name && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 max-h-60 overflow-y-auto shadow-lg top-full left-0">
                  {rootbeers
                    .filter(rb => rb.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 5)
                    .map(rb => (
                      <li
                        key={rb.rootbeer_id}
                        className={`px-4 py-2 cursor-pointer hover:bg-rootbeer-100 ${scorecardData.rootBeerId === rb.rootbeer_id ? 'bg-rootbeer-200' : ''}`}
                        onClick={() => {
                          setScorecardData({ ...scorecardData, rootBeerId: rb.rootbeer_id });
                          setSearchTerm(rb.name); // Show selected name in input
                        }}
                      >
                        {rb.name}
                      </li>
                    ))}
                  {rootbeers.filter(rb => rb.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <li className="px-4 py-2 text-gray-400">No matches found.</li>
                  )}
                </ul>
              )}
              <input type="hidden" required value={scorecardData.rootBeerId || ''} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl text-rootbeer-700 mb-6">Rating Criteria</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg text-rootbeer-700 font-semibold">Rating</h3>
                <span className="bg-rootbeer-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Max: 10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={10}
                  step="0.01"
                  value={scorecardData.overallRating || ''}
                  onChange={e => handleScoreChange(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-semibold text-base transition-colors duration-200 focus:outline-none focus:border-rootbeer-700"
                />
                <span className="text-gray-600 font-medium">/ 10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl text-rootbeer-700 mb-6">Notes</h2>
          <textarea
            value={scorecardData.notes}
            onChange={(e) => setScorecardData({
              ...scorecardData,
              notes: e.target.value
            })}
            placeholder="Add your tasting notes, impressions, and comments..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base font-inherit resize-y min-h-32 transition-colors duration-200 focus:outline-none focus:border-rootbeer-700"
          />
          <div className="flex items-center mt-4">
            <input
              id="isRootbeerCheckbox"
              type="checkbox"
              checked={isRootbeer}
              onChange={e => setIsRootbeer(e.target.checked)}
              className="mr-2 h-5 w-5 text-rootbeer-700 focus:ring-rootbeer-700 border-gray-300 rounded"
            />
            <label htmlFor="isRootbeerCheckbox" className="text-gray-700 font-medium select-none">
              Is this a root beer?
            </label>
          </div>
        </div>

        {submitError && <div className="text-center text-red-500 mb-4">{submitError}</div>}
        <div className="flex gap-4 justify-center">
          <button type="submit" className="btn btn-primary">
            Submit Scorecard
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScorecardPage;