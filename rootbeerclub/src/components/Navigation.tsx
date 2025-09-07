import { Link, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const Navigation = () => {
  const location = useLocation();
  const { user, logout, loading } = useUser();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 flex justify-between items-center h-16">
        <Link to="/" className="text-2xl font-bold text-rootbeer-700 hover:text-rootbeer-800 transition-colors duration-200">
          🍺 RootBeerClub
        </Link>
        
        <ul className="flex space-x-8 items-center">
          <li>
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                isActive('/') 
                  ? 'text-rootbeer-700 bg-yellow-50 font-semibold' 
                  : 'text-gray-600 hover:text-rootbeer-700 hover:bg-gray-50'
              }`}
            >
              Home
              {isActive('/') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-rootbeer-700 rounded-full"></span>
              )}
            </Link>
          </li>
          <li>
            <Link 
              to="/rootbeers" 
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                isActive('/rootbeers') 
                  ? 'text-rootbeer-700 bg-yellow-50 font-semibold' 
                  : 'text-gray-600 hover:text-rootbeer-700 hover:bg-gray-50'
              }`}
            >
              Root Beers
              {isActive('/rootbeers') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-rootbeer-700 rounded-full"></span>
              )}
            </Link>
          </li>
          <li>
            <Link 
              to="/scorecard" 
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                isActive('/scorecard') 
                  ? 'text-rootbeer-700 bg-yellow-50 font-semibold' 
                  : 'text-gray-600 hover:text-rootbeer-700 hover:bg-gray-50'
              }`}
            >
              Scorecard
              {isActive('/scorecard') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-rootbeer-700 rounded-full"></span>
              )}
            </Link>
          </li>
          <li>
            <Link 
              to="/judges" 
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                isActive('/judges') 
                  ? 'text-rootbeer-700 bg-yellow-50 font-semibold' 
                  : 'text-gray-600 hover:text-rootbeer-700 hover:bg-gray-50'
              }`}
            >
              Judges
              {isActive('/judges') && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-rootbeer-700 rounded-full"></span>
              )}
            </Link>
          </li>
          {user ? (
            <>
              <li className="text-gray-700 font-medium">Logged in as {user.firstName}</li>
              <li>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md font-medium bg-red-500 text-white hover:bg-red-600 transition"
                  disabled={loading}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link 
                to="/login" 
                className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                  isActive('/login') 
                    ? 'text-rootbeer-700 bg-yellow-50 font-semibold' 
                    : 'text-gray-600 hover:text-rootbeer-700 hover:bg-gray-50'
                }`}
              >
                Login
                {isActive('/login') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-0.5 bg-rootbeer-700 rounded-full"></span>
                )}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;