import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Judge {
  user_id: number;
  firstname: string;
  lastname: string;
  about?: string;
}

const JudgesPage = () => {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const res = await fetch('http://localhost:3000/users');
        if (!res.ok) throw new Error('Failed to fetch judges');
        const data = await res.json();
        setJudges(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchJudges();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl text-rootbeer-700 mb-8 text-center">Meet the Judges</h1>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {judges.map(judge => (
          <Link
            to={`/judges/${judge.user_id}`}
            key={judge.user_id}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center hover:bg-rootbeer-50 transition"
          >
            <div className="text-xl font-bold text-rootbeer-700 mb-2">
              {judge.firstname} {judge.lastname}
            </div>
            <div className="text-gray-600 text-center">{judge.about || 'No bio available.'}</div>
            <span className="mt-4 text-rootbeer-700 underline text-sm">View Profile</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JudgesPage;