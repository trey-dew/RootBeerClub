import { Link, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const Navigation = () => {
  const location = useLocation();
  const { user, logout } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700 hover:bg-rootbeer-50'
        }`}
      >
        Home
      </Link>
      <Link
        to="/rootbeers"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/rootbeers') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700 hover:bg-rootbeer-50'
        }`}
      >
        Root Beers
      </Link>
      <Link
        to="/scorecard"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/scorecard') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700 hover:bg-rootbeer-50'
        }`}
      >
        Score Card
      </Link>
      <Link
        to="/judges"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive('/judges') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700 hover:bg-rootbeer-50'
        }`}
      >
        Judges
      </Link>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Hi, {user.firstName}</span>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="px-4 py-2 text-sm font-medium text-white bg-rootbeer-600 rounded-md hover:bg-rootbeer-700"
        >
          Login
        </Link>
      )}
    </nav>
  );
};

export default Navigation;