import { useState } from 'react';

interface ScorecardCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
}

interface ScorecardData {
  rootBeerName: string;
  brand: string;
  date: string;
  scores: Record<string, number>;
  notes: string;
  overallRating: number;
}

const ScorecardPage = () => {
  const [scorecardData, setScorecardData] = useState<ScorecardData>({
    rootBeerName: '',
    brand: '',
    date: new Date().toISOString().split('T')[0],
    scores: {},
    notes: '',
    overallRating: 0
  });

  const criteria: ScorecardCriteria[] = [
    {
     
      id: 'overall',
      name: 'Overall Impression',
      description: 'Overall enjoyment and drinkability',
      maxScore: 20
    }
  ];

  const handleScoreChange = (criteriaId: string, score: number) => {
    const newScores = { ...scorecardData.scores, [criteriaId]: score };
    const totalScore = criteria.reduce((sum, criterion) => {
      return sum + (newScores[criterion.id] || 0);
    }, 0);
    
    setScorecardData({
      ...scorecardData,
      scores: newScores,
      overallRating: totalScore
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Scorecard submitted:', scorecardData);
    // Here you would typically save to a database or state management
    alert('Scorecard submitted successfully!');
  };

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
            <div className="flex flex-col">
              <label htmlFor="rootBeerName" className="font-semibold mb-2 text-gray-700">Root Beer Name</label>
              <input
                type="text"
                id="rootBeerName"
                value={scorecardData.rootBeerName}
                onChange={(e) => setScorecardData({
                  ...scorecardData,
                  rootBeerName: e.target.value
                })}
                required
                className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-rootbeer-700"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl text-rootbeer-700 mb-6">Rating Criteria</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg text-rootbeer-700 font-semibold">{criterion.name}</h3>
                  <span className="bg-rootbeer-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Max: {criterion.maxScore}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{criterion.description}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={criterion.maxScore}
                    value={scorecardData.scores[criterion.id] || ''}
                    onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-semibold text-base transition-colors duration-200 focus:outline-none focus:border-rootbeer-700"
                  />
                  <span className="text-gray-600 font-medium">/ {criterion.maxScore}</span>
                </div>
              </div>
            ))}
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

        <div className="flex gap-4 justify-center">
          <button type="submit" className="btn btn-primary">
            Submit Scorecard
          </button>
          <button type="button" className="btn btn-secondary">
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScorecardPage; 