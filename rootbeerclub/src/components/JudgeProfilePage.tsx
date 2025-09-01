import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Judge {
  user_id: number;
  firstname: string;
  lastname: string;
  about?: string;
}

interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
}

const JudgeProfilePage = () => {
  const { judgeId } = useParams<{ judgeId: string }>();
  const [judge, setJudge] = useState<Judge | null>(null);
  const [topRootBeers, setTopRootBeers] = useState<RootBeer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJudgeAndTopRootBeers = async () => {
      try {
        // Fetch judge info
        const judgeRes = await fetch(`${API_BASE_URL}/users/${judgeId}`);
        if (!judgeRes.ok) throw new Error('Failed to fetch judge');
        const judgeData = await judgeRes.json();
        setJudge(judgeData);

        // Fetch top 10 rootbeers rated by this judge
        const topRes = await fetch(`${API_BASE_URL}/ratings/top10?user_id=${judgeId}`);
        if (!topRes.ok) throw new Error('Failed to fetch top rootbeers');
        let topData = await topRes.json();

        // Filter to only unique rootbeer_id, keeping the highest rating for each
        const uniqueMap = new Map<number, RootBeer>();
        for (const rb of topData) {
          if (
            !uniqueMap.has(rb.rootbeer_id) ||
            (uniqueMap.get(rb.rootbeer_id)?.rating ?? -Infinity) < rb.rating
          ) {
            uniqueMap.set(rb.rootbeer_id, rb);
          }
        }
        // Get top 10 unique
        const uniqueTop = Array.from(uniqueMap.values())
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);

        setTopRootBeers(uniqueTop);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchJudgeAndTopRootBeers();
  }, [judgeId]);

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/judges" className="text-rootbeer-700 underline mb-4 inline-block">&larr; Back to Judges</Link>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {judge && (
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-rootbeer-700 mb-2">
            {judge.firstname} {judge.lastname}
          </h2>
          <div className="text-gray-600 mb-4">{judge.about || 'No bio available.'}</div>
        </div>
      )}
      <h3 className="text-xl font-semibold text-rootbeer-700 mb-4">Top 10 Rated Root Beers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topRootBeers.length === 0 && (
          <div className="text-gray-500 col-span-2">No ratings yet.</div>
        )}
        {topRootBeers.map(rb => (
          <Link
            to={`/rootbeers/${rb.rootbeer_id}`}
            key={rb.rootbeer_id}
            className="bg-rootbeer-50 rounded-lg p-4 flex items-center gap-4 hover:bg-rootbeer-100 transition"
          >
            {rb.logo && (
              <img src={rb.logo} alt={rb.name} className="w-16 h-16 object-contain rounded" />
            )}
            <div>
              <div className="font-bold text-rootbeer-700">{rb.name}</div>
              <div className="text-rootbeer-700">Rating: {rb.rating}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JudgeProfilePage;