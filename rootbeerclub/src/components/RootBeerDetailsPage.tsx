import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  firstname: string;  // Changed from firstName
  lastname: string;   // Changed from lastName
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
        // Fetch rootbeer details - no auth required
        const rbRes = await fetch(`${API_BASE_URL}/rootbeers/${rootbeer_id}`);

        if (!rbRes.ok) {
          if (rbRes.status === 404) {
            throw new Error('Root beer not found');
          }
          throw new Error('Failed to fetch root beer details');
        }

        const rbData = await rbRes.json();
        setRootbeer(rbData);

        // Fetch ratings - no auth required
        const ratingsRes = await fetch(`${API_BASE_URL}/ratings`);

        if (!ratingsRes.ok) {
          throw new Error('Failed to fetch ratings');
        }

        const ratingsData: Rating[] = await ratingsRes.json();
        setRatings(ratingsData.filter(r => r.rootbeer_id === Number(rootbeer_id)));

        // Fetch users - no auth required for public info
        const usersRes = await fetch(`${API_BASE_URL}/users`);

        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }

        const usersData: UserInfo[] = await usersRes.json();
        setUsers(usersData);

      } catch (err: any) {
        console.error('Error fetching details:', err);
        setError(err.message || 'An error occurred');
        if (err.message.includes('not found')) {
          navigate('/rootbeers');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [rootbeer_id, navigate]);

  // Add loading states with better UI feedback
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => navigate('/rootbeers')}
            className="mt-3 bg-red-100 px-4 py-2 rounded hover:bg-red-200 transition"
          >
            Return to Root Beers
          </button>
        </div>
      </div>
    );
  }

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
