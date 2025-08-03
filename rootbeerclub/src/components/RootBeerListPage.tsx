import { useState, useEffect } from 'react';
import { useUser } from './UserContext';

interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
  rootbeer_facts?: string;
}

const RootBeerListPage = () => {
  const { user } = useUser();
  const [rootBeers, setRootBeers] = useState<RootBeer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateSearch, setUpdateSearch] = useState('');
  const [selectedRootBeer, setSelectedRootBeer] = useState<RootBeer | null>(null);
  const [updateForm, setUpdateForm] = useState({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: true });
  const [updateFormError, setUpdateFormError] = useState<string | null>(null);
  const [updateFormLoading, setUpdateFormLoading] = useState(false);

  const fetchRootBeers = async () => {
    setLoading(true);
    setError(null);
    try {
      const username = import.meta.env.VITE_API_USERNAME;
      const password = import.meta.env.VITE_API_PASSWORD;
      const basicAuth = btoa(`${username}:${password}`);

      const res = await fetch('http://localhost:3000/rootbeers', {
        headers: {
          'Authorization': `Basic ${basicAuth}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch root beers');
      const data = await res.json();
      setRootBeers(data.map((beer: any) => ({
        ...beer,
        rating: beer.rating !== undefined && beer.rating !== null ? Number(beer.rating) : null
      })));
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootBeers();
  }, []);

  const filteredRootBeers = rootBeers.filter(beer =>
    beer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(form => ({
        ...form,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setForm(form => ({
        ...form,
        [name]: value
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      if (!form.name || !form.rating) {
        setFormError('Name and rating are required.');
        setFormLoading(false);
        return;
      }
      const username = import.meta.env.VITE_API_USERNAME;
      const password = import.meta.env.VITE_API_PASSWORD;
      const basicAuth = btoa(`${username}:${password}`);
      const res = await fetch('http://localhost:3000/rootbeers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({
          name: form.name,
          rating: Number(form.rating),
          logo: form.logo,
          rootbeer_facts: form.rootbeer_facts,
          nutrition_facts: form.nutrition_facts,
          is_rootbeer: form.is_rootbeer
        })
      });
      if (!res.ok) throw new Error('Failed to add root beer');
      setShowForm(false);
      setForm({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: true });
      await fetchRootBeers();
    } catch (err: any) {
      setFormError(err.message || 'Unknown error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setUpdateForm(form => ({
        ...form,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setUpdateForm(form => ({
        ...form,
        [name]: value
      }));
    }
  };

  const handleSelectRootBeer = (beer: RootBeer) => {
    setSelectedRootBeer(beer);
    setUpdateForm({
      name: beer.name || '',
      rating: beer.rating !== undefined && beer.rating !== null ? String(beer.rating) : '',
      logo: beer.logo || '',
      rootbeer_facts: beer.rootbeer_facts || '',
      nutrition_facts: (beer as any).nutrition_facts || '',
      is_rootbeer: (beer as any).is_rootbeer ?? true
    });
  };

  const handleUpdateFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateFormError(null);
    setUpdateFormLoading(true);
    try {
      if (!selectedRootBeer) {
        setUpdateFormError('No root beer selected.');
        setUpdateFormLoading(false);
        return;
      }
      if (!updateForm.name || !updateForm.rating) {
        setUpdateFormError('Name and rating are required.');
        setUpdateFormLoading(false);
        return;
      }
      const username = import.meta.env.VITE_API_USERNAME;
      const password = import.meta.env.VITE_API_PASSWORD;
      const basicAuth = btoa(`${username}:${password}`);
      const res = await fetch(`http://localhost:3000/rootbeers/${selectedRootBeer.rootbeer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({
          name: updateForm.name,
          rating: Number(updateForm.rating),
          logo: updateForm.logo,
          rootbeer_facts: updateForm.rootbeer_facts,
          nutrition_facts: updateForm.nutrition_facts,
          is_rootbeer: updateForm.is_rootbeer
        })
      });
      if (!res.ok) throw new Error('Failed to update root beer');
      setShowUpdate(false);
      setSelectedRootBeer(null);
      setUpdateForm({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: true });
      await fetchRootBeers();
    } catch (err: any) {
      setUpdateFormError(err.message || 'Unknown error');
    } finally {
      setUpdateFormLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl text-rootbeer-700 mb-2">Root Beer Collection</h1>
        <p className="text-xl text-gray-600">Discover and explore our collection of root beers</p>
      </div>

      {user?.email === 'Trey.Dew@outlook.com' && (
        <div className="mb-8 text-center flex flex-row items-center justify-center gap-4">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Cancel' : 'Add Root Beer'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowUpdate((v) => !v)}
          >
            {showUpdate ? 'Cancel' : 'Update Root Beer'}
          </button>
        </div>
      )}

      {showUpdate && user?.email === 'Trey.Dew@outlook.com' && (
        <div className="max-w-lg mx-auto mb-8 bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block font-semibold mb-1">Search Root Beer by Name</label>
            <input
              type="text"
              value={updateSearch}
              onChange={e => setUpdateSearch(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Type to search..."
            />
          </div>
          {updateSearch && (
            <div className="border rounded bg-gray-50 max-h-40 overflow-y-auto">
              {rootBeers.filter(b => b.name.toLowerCase().includes(updateSearch.toLowerCase())).map(b => (
                <div
                  key={b.rootbeer_id}
                  className={`px-3 py-2 cursor-pointer hover:bg-rootbeer-100 ${selectedRootBeer?.rootbeer_id === b.rootbeer_id ? 'bg-rootbeer-200' : ''}`}
                  onClick={() => handleSelectRootBeer(b)}
                >
                  {b.name}
                </div>
              ))}
              {rootBeers.filter(b => b.name.toLowerCase().includes(updateSearch.toLowerCase())).length === 0 && (
                <div className="px-3 py-2 text-gray-400">No matches found.</div>
              )}
            </div>
          )}
          {selectedRootBeer && (
            <form onSubmit={handleUpdateFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={updateForm.name}
                  onChange={handleUpdateFormChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rating (0-10)</label>
                <input
                  type="number"
                  name="rating"
                  value={updateForm.rating}
                  onChange={handleUpdateFormChange}
                  min={0}
                  max={10}
                  step={0.01}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Logo URL</label>
                <input
                  type="text"
                  name="logo"
                  value={updateForm.logo}
                  onChange={handleUpdateFormChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Nutrition Facts</label>
                <input
                  type="text"
                  name="nutrition_facts"
                  value={updateForm.nutrition_facts}
                  onChange={handleUpdateFormChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Root Beer Facts</label>
                <textarea
                  name="rootbeer_facts"
                  value={updateForm.rootbeer_facts}
                  onChange={handleUpdateFormChange}
                  className="w-full border px-3 py-2 rounded"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_rootbeer"
                  checked={updateForm.is_rootbeer}
                  onChange={handleUpdateFormChange}
                  className="h-4 w-4"
                />
                <label className="font-semibold">Is Root Beer?</label>
              </div>
              {updateFormError && <div className="text-red-500 text-sm">{updateFormError}</div>}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={updateFormLoading}
              >
                {updateFormLoading ? 'Updating...' : 'Update Root Beer'}
              </button>
            </form>
          )}
        </div>
      )}

      {showForm && user?.email === 'Trey.Dew@outlook.com' && (
        <form onSubmit={handleFormSubmit} className="max-w-lg mx-auto mb-8 bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Rating (0-10)</label>
            <input
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleFormChange}
              min={0}
              max={10}
              step={0.01}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Logo URL</label>
            <input
              type="text"
              name="logo"
              value={form.logo}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Nutrition Facts</label>
            <input
              type="text"
              name="nutrition_facts"
              value={form.nutrition_facts}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Root Beer Facts</label>
            <textarea
              name="rootbeer_facts"
              value={form.rootbeer_facts}
              onChange={handleFormChange}
              className="w-full border px-3 py-2 rounded"
              rows={3}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_rootbeer"
              checked={form.is_rootbeer}
              onChange={handleFormChange}
              className="h-4 w-4"
            />
            <label className="font-semibold">Is Root Beer?</label>
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={formLoading}
          >
            {formLoading ? 'Adding...' : 'Add Root Beer'}
          </button>
        </form>
      )}

      <div className="mb-12 text-center">
        <input
          type="text"
          placeholder="Search root beers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-6 py-4 border-2 border-gray-200 rounded-xl text-lg bg-white shadow-lg transition-all duration-200 focus:outline-none focus:border-rootbeer-700 focus:shadow-xl"
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-600 text-lg">Loading root beers...</div>
      )}
      {error && (
        <div className="text-center py-12 text-red-500 text-lg">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRootBeers.map((beer) => (
              <div key={beer.rootbeer_id} className="bg-white rounded-xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                {beer.logo && (
                  <img src={beer.logo} alt={beer.name} className="mb-4 w-full h-40 object-contain rounded" />
                )}
                <div className="mb-4">
                  <h3 className="text-2xl text-rootbeer-700 mb-2">{beer.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-rootbeer-700 text-lg">
                  Rating: {beer.rating !== undefined && beer.rating !== null && !isNaN(Number(beer.rating))
                  ? parseFloat(Number(beer.rating).toFixed(2)).toString()
                  : 'N/A'}
                </span>

                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                  {(beer.rootbeer_facts?.length ?? 0) > 100
                  ? `${beer.rootbeer_facts?.slice(0, 100)}...`
                  : beer.rootbeer_facts || 'No description available.'}
                </p>
                <a
                  href={`/rootbeers/${beer.rootbeer_id}`}
                  className="btn btn-primary w-full text-center block"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>

          {filteredRootBeers.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-lg">
              <p>No root beers found matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RootBeerListPage; 