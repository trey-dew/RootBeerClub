import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface TopRootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
  total_ratings: number;
}

const HomePage = () => {
  const [topRootBeers, setTopRootBeers] = useState<TopRootBeer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRootBeers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/top-rootbeers`);
        if (!response.ok) {
          throw new Error('Failed to fetch top root beers');
        }
        const data = await response.json();
        setTopRootBeers(data);
      } catch (error) {
        console.error('Error fetching top root beers:', error);
        setError('Failed to load top root beers');
      } finally {
        setLoading(false);
      }
    };

    fetchTopRootBeers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center py-12 px-6 bg-gradient-to-br from-rootbeer-700 to-rootbeer-800 text-white rounded-2xl mb-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          The Family Root Beer Club
        </h1>
        <p className="text-lg mb-6 opacity-90">
          Started with a Christmas gift and 100+ root beers, 
          we're just a family rating our favorite brews
        </p>
        <Link to="/rootbeers" 
          className="inline-block bg-white text-rootbeer-700 hover:bg-gray-50 
            rounded-lg py-2 px-6 text-lg font-medium transition-colors">
          Check Out Our Reviews
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Our Family's Top 10 Root Beers
        </h2>
        {loading ? (
          <div className="text-center py-4">Loading our favorites...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topRootBeers.map((beer, index) => (
              <Link 
                key={beer.rootbeer_id}
                to={`/rootbeers/${beer.rootbeer_id}`}
                className="flex items-center p-4 bg-rootbeer-50 rounded-lg hover:bg-rootbeer-100 transition-colors"
              >
                <span className="text-2xl font-bold text-rootbeer-700 mr-4">
                  #{index + 1}
                </span>
                <div className="flex-grow">
                  <h3 className="font-medium text-rootbeer-800">{beer.name}</h3>
                  <p className="text-sm text-rootbeer-600">
                    Rating: {beer.rating} ({beer.total_ratings} {beer.total_ratings === 1 ? 'review' : 'reviews'})
                  </p>
                </div>
                {beer.logo && (
                  <img 
                    src={beer.logo} 
                    alt={beer.name} 
                    className="w-12 h-12 object-contain"
                  />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;