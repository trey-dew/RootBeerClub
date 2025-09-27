import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
}

const HomePage = () => {
  const [topRootBeers, setTopRootBeers] = useState<RootBeer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopRootBeers = async () => {
      try {
        // Using the same params as RootBeerListPage for top rated
        const params = new URLSearchParams({
          page: '1',
          pageSize: '10',
          sortBy: 'rating',
          sortOrder: 'desc',
          rated_only: 'true'
        });

        const res = await fetch(`${API_BASE_URL}/rootbeers?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch root beers');
        const data = await res.json();
        setTopRootBeers(data.data.map((beer: any) => ({
          ...beer,
          rating: beer.rating !== undefined && beer.rating !== null ? Number(beer.rating) : null
        })));
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
    <div className="max-w-3xl mx-auto px-4">
      <div className="text-center py-12 px-6 bg-gradient-to-br from-rootbeer-700 to-rootbeer-800 text-white rounded-2xl mb-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-4">
          The Dew Family Root Beer Club
        </h1>
        <p className="text-lg mb-8 opacity-90">
          Founded Christmas of 2023, Chris, Jake, Jim and Trey review 4 rootbeers
          every meeting to find the best rootbeer around.
        </p>
        <div className="flex flex-wrap justify-center gap-4 px-4">
          <Link to="/rootbeers" 
            className="inline-block bg-white text-rootbeer-700 hover:bg-gray-50 
              rounded-lg py-3 px-8 text-lg font-medium transition-colors">
            Rootbeers
          </Link>
          <Link to="/judges" 
            className="inline-block bg-white text-rootbeer-700 hover:bg-gray-50 
              rounded-lg py-3 px-8 text-lg font-medium transition-colors">
            Judges
          </Link>
          <Link to="/scorecard" 
            className="inline-block bg-white text-rootbeer-700 hover:bg-gray-50 
              rounded-lg py-3 px-8 text-lg font-medium transition-colors">
            Scorecard
          </Link>
          <Link to="/stats" 
            className="inline-block bg-white text-rootbeer-700 hover:bg-gray-50 
              rounded-lg py-3 px-8 text-lg font-medium transition-colors">
            Club Stats
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Club Stats
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-rootbeer-50 rounded-lg">
            <p className="text-3xl font-bold text-rootbeer-700 mb-2">{topRootBeers.length}</p>
            <p className="text-sm text-rootbeer-600">Root Beers Rated</p>
          </div>
          <div className="p-4 bg-rootbeer-50 rounded-lg">
            <p className="text-3xl font-bold text-rootbeer-700 mb-2">4</p>
            <p className="text-sm text-rootbeer-600">Family Judges</p>
          </div>
          <div className="p-4 bg-rootbeer-50 rounded-lg">
            <p className="text-3xl font-bold text-rootbeer-700 mb-2">
              {topRootBeers[0]?.name || 'Loading...'}
            </p>
            <p className="text-sm text-rootbeer-600">Current #1</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Our Top 10 Root Beers
        </h2>
        {loading ? (
          <div className="text-center py-4">Loading our favorites...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {topRootBeers.map((beer, index) => (
              <Link 
                key={beer.rootbeer_id}
                to={`/rootbeers/${beer.rootbeer_id}`}
                className="flex items-center p-6 bg-rootbeer-50 rounded-lg hover:bg-rootbeer-100 transition-colors"
              >
                <span className="text-3xl font-bold text-rootbeer-700 mr-6">
                  #{index + 1}
                </span>
                <div className="flex-grow grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-medium text-rootbeer-800">{beer.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-rootbeer-600 font-medium">
                      {beer.rating === 0
                        ? 'Not Rated'
                        : (beer.rating !== undefined && beer.rating !== null && !isNaN(Number(beer.rating))
                            ? parseFloat(Number(beer.rating).toFixed(2)).toString()
                            : 'N/A')}
                    </p>
                  </div>
                </div>
                {beer.logo && (
                  <img 
                    src={beer.logo} 
                    alt={beer.name} 
                    className="w-20 h-20 object-contain ml-6"
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