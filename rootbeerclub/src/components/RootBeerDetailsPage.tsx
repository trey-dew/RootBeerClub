
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  date_tested: string;
  logo: string;
  nutrition_facts: string;
  is_rootbeer: boolean;
  rootbeer_facts: string;
}

interface Rating {
  rating_id: number;
  rootbeer_id: number;
  comment: string;
  rating: number;
  user_id: number;
}

interface UserInfo {
  user_id: number;
  firstname: string;
  lastname: string;
}

const RootBeerDetailsPage: React.FC = () => {
  const { rootbeer_id } = useParams<{ rootbeer_id: string }>();
  const navigate = useNavigate();
  const [rootbeer, setRootbeer] = useState<RootBeer | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const rbRes = await fetch(`http://localhost:3000/rootbeers/${rootbeer_id}`);
        if (!rbRes.ok) throw new Error('Rootbeer not found');
        const rbData = await rbRes.json();
        setRootbeer(rbData);

        const ratingsRes = await fetch('http://localhost:3000/ratings');
        const ratingsData: Rating[] = await ratingsRes.json();
        setRatings(ratingsData.filter(r => r.rootbeer_id === Number(rootbeer_id)));

        const usersRes = await fetch('http://localhost:3000/users');
        const usersData: UserInfo[] = await usersRes.json();
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [rootbeer_id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!rootbeer) return <div>Rootbeer not found.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded p-6">
      <button
        className="mb-4 px-4 py-2 bg-rootbeer-700 text-white rounded hover:bg-rootbeer-800 transition"
        onClick={() => navigate('/rootbeers')}
      >
        &larr; Return
      </button>
      <div className="flex items-center mb-4 gap-6">
        {rootbeer.logo && (
          <img src={rootbeer.logo} alt={rootbeer.name} className="w-32 h-32 object-contain rounded shadow" />
        )}
        {rootbeer.nutrition_facts && rootbeer.nutrition_facts.match(/\.(jpg|jpeg|png|gif|svg)$/i) ? (
          <img
            src={rootbeer.nutrition_facts}
            alt={rootbeer.name + ' Nutrition Facts'}
            className="w-32 h-32 object-contain rounded shadow"
          />
        ) : (
          <div className="flex flex-col">
            <h3 className="font-semibold">Nutrition Facts</h3>
            <p>{rootbeer.nutrition_facts}</p>
          </div>
        )}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <h2 className="text-xl font-bold mb-1">Name</h2>
          <p className="text-lg">{rootbeer.name}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Rating</h2>
          <p className="text-lg">{rootbeer.rating}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Date Tested</h2>
          <p className="text-lg">{rootbeer.date_tested}</p>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Rootbeer Facts</h3>
        <p>{rootbeer.rootbeer_facts}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Judges' Comments & Ratings</h3>
        {ratings.length === 0 ? (
          <p>No ratings or comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {ratings.map(r => {
              const judge = users.find(u => u.user_id === r.user_id);
              const judgeName = judge ? `${judge.firstname} ${judge.lastname}` : `Judge ID: ${r.user_id}`;
              return (
                <li key={r.rating_id} className="border rounded p-2">
                  <p className="font-medium">Rating: {r.rating}</p>
                  <p className="italic">"{r.comment}"</p>
                  <p className="text-xs text-gray-400">{judgeName}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RootBeerDetailsPage;
