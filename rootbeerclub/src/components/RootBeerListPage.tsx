import { useState } from 'react';

interface RootBeer {
  id: number;
  name: string;
  brand: string;
  rating: number;
  description: string;
  imageUrl?: string;
}

const RootBeerListPage = () => {
  const [rootBeers] = useState<RootBeer[]>([
    {
      id: 1,
      name: "A&W Root Beer",
      brand: "A&W",
      rating: 4.2,
      description: "Classic creamy root beer with a smooth vanilla finish"
    },
    {
      id: 2,
      name: "Barq's Root Beer",
      brand: "Barq's",
      rating: 4.0,
      description: "Bold and fizzy with a distinctive bite"
    },
    {
      id: 3,
      name: "Mug Root Beer",
      brand: "Mug",
      rating: 3.8,
      description: "Smooth and creamy with a traditional root beer taste"
    },
    {
      id: 4,
      name: "Dad's Root Beer",
      brand: "Dad's",
      rating: 4.5,
      description: "Rich and full-bodied with authentic root beer flavor"
    },
    {
      id: 5,
      name: "Sprecher Root Beer",
      brand: "Sprecher",
      rating: 4.7,
      description: "Premium craft root beer with honey and vanilla notes"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRootBeers = rootBeers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beer.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl text-rootbeer-700 mb-2">Root Beer Collection</h1>
        <p className="text-xl text-gray-600">Discover and explore our collection of root beers</p>
      </div>

      <div className="mb-12 text-center">
        <input
          type="text"
          placeholder="Search root beers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-6 py-4 border-2 border-gray-200 rounded-xl text-lg bg-white shadow-lg transition-all duration-200 focus:outline-none focus:border-rootbeer-700 focus:shadow-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRootBeers.map((beer) => (
          <div key={beer.id} className="bg-white rounded-xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
            <div className="mb-4">
              <h3 className="text-2xl text-rootbeer-700 mb-2">{beer.name}</h3>
              <span className="text-gray-600 font-medium">{beer.brand}</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400 text-xl tracking-wider">
                {'★'.repeat(Math.floor(beer.rating))}
                {'☆'.repeat(5 - Math.floor(beer.rating))}
              </span>
              <span className="font-semibold text-rootbeer-700 text-lg">{beer.rating.toFixed(1)}</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm">{beer.description}</p>
            <button className="btn btn-primary w-full">View Details</button>
          </div>
        ))}
      </div>

      {filteredRootBeers.length === 0 && (
        <div className="text-center py-12 text-gray-600 text-lg">
          <p>No root beers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default RootBeerListPage; 