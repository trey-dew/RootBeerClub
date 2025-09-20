import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-rootbeer-700"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg z-50">
          <div className="flex flex-col p-4 space-y-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-md ${isActive('/') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700'}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/rootbeers"
              className={`px-4 py-2 rounded-md ${isActive('/rootbeers') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700'}`}
              onClick={() => setIsOpen(false)}
            >
              Root Beers
            </Link>
            <Link
              to="/scorecard"
              className={`px-4 py-2 rounded-md ${isActive('/scorecard') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700'}`}
              onClick={() => setIsOpen(false)}
            >
              Score Card
            </Link>
            <Link
              to="/judges"
              className={`px-4 py-2 rounded-md ${isActive('/judges') ? 'bg-rootbeer-100 text-rootbeer-700' : 'text-gray-700'}`}
              onClick={() => setIsOpen(false)}
            >
              Judges
            </Link>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-md bg-red-500 text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-rootbeer-600 text-white text-center"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;