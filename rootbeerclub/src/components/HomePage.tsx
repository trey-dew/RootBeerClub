import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16 px-8 bg-gradient-to-br from-rootbeer-700 to-rootbeer-800 text-white rounded-2xl mb-16 shadow-2xl">
        <h1 className="text-5xl font-bold mb-4">
          Welcome to RootBeerClub
        </h1>
        <p className="text-xl mb-10 opacity-90 font-light">
          Discover, Rate, and Share Your Favorite Root Beers
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/rootbeers" className="btn bg-white text-rootbeer-700 hover:bg-gray-50 hover:text-rootbeer-700 min-w-40 py-4 px-8 text-lg">
            Browse Root Beers
          </Link>
          <Link to="/scorecard" className="btn bg-transparent text-white border-2 border-white hover:bg-white hover:text-rootbeer-700 min-w-40 py-4 px-8 text-lg">
            Create Scorecard
          </Link>
        </div>
      </div>
      
      <div className="py-8">
        <h2 className="text-4xl text-rootbeer-700 text-center mb-12">
          What We Offer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl text-rootbeer-700 mb-4">🍺 Root Beer Collection</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore our extensive collection of root beers from around the world
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl text-rootbeer-700 mb-4">📊 Rating System</h3>
            <p className="text-gray-600 leading-relaxed">
              Rate and review your favorite root beers with our detailed scorecard
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-2xl text-rootbeer-700 mb-4">👥 Community</h3>
            <p className="text-gray-600 leading-relaxed">
              Join fellow root beer enthusiasts and share your discoveries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 