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
          user_id: user.user_id
        })
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      alert('Scorecard submitted successfully!');
      setScorecardData({ rootBeerId: null, notes: '', overallRating: 0 });
      setSearchTerm('');
      // setSelectedUserId(null); // No longer needed
    } catch (err: any) {
      setSubmitError(err.message || 'Unknown error');
    }
  };

  useEffect(() => {
    const fetchRootbeers = async () => {
      try {
        const res = await fetch('http://localhost:3000/rootbeers');
        const data = await res.json();
        setRootbeers(data);
      } catch {
        setRootbeers([]);
      }
    };
    // fetchUsers removed
    fetchRootbeers();
    // fetchUsers();
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
            <div className="flex flex-col">
              <label htmlFor="rootBeerSelect" className="font-semibold mb-2 text-gray-700">Root Beer Name</label>
              <input
                type="text"
                placeholder="Search root beers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mb-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-base"
              />
              <select
                id="rootBeerSelect"
                value={scorecardData.rootBeerId || ''}
                onChange={e => setScorecardData({ ...scorecardData, rootBeerId: Number(e.target.value) })}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-rootbeer-700"
              >
                <option value="">Select a root beer...</option>
                {rootbeers.filter(rb => rb.name.toLowerCase().includes(searchTerm.toLowerCase())).map(rb => (
                  <option key={rb.rootbeer_id} value={rb.rootbeer_id}>{rb.name}</option>
                ))}
              </select>
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