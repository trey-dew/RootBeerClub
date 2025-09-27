import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  email: string;
  isAdmin: boolean;  // Changed from is_admin to match JWT token
  firstName: string;
  lastName: string;
}

interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
  rootbeer_facts?: string;
  is_rootbeer?: boolean;
}

const RootBeerListPage = () => {
  const { user } = useUser() as { user: User | null };
  const [rootBeers, setRootBeers] = useState<RootBeer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: false });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedRootBeer, setSelectedRootBeer] = useState<RootBeer | null>(null);
  const [updateForm, setUpdateForm] = useState({ name: '', rating: '', logo: '', rootbeer_facts: '', nutrition_facts: '', is_rootbeer: true });
  const [updateFormError, setUpdateFormError] = useState<string | null>(null);
  const [updateFormLoading, setUpdateFormLoading] = useState(false);
  // Filtering state
  const [sortBy, setSortBy] = useState<'name' | 'rating'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRootbeer, setFilterRootbeer] = useState<'all' | 'rootbeer' | 'notrootbeer' | 'rated'>('all');


  const fetchRootBeers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (filterRootbeer === 'rootbeer') {
        params.append('is_rootbeer', 'true');
      } else if (filterRootbeer === 'notrootbeer') {
        params.append('is_rootbeer', 'false');
      } else if (filterRootbeer === 'rated') {
        params.append('rated_only', 'true');
      }
      const res = await fetch(`${API_BASE_URL}/rootbeers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch root beers');
      const data = await res.json();
      setRootBeers(data.data.map((beer: any) => ({
        ...beer,
        rating: beer.rating !== undefined && beer.rating !== null ? Number(beer.rating) : null
      })));
      setTotal(data.total);
    } catch (err) {
      setError((err && (err as any).message) || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, search, sort, or filter changes
  useEffect(() => {
    fetchRootBeers(currentPage);
    // eslint-disable-next-line
  }, [currentPage, sortBy, sortOrder, filterRootbeer, searchTerm]);

  // Reset to page 1 if search, sort, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, filterRootbeer]);

  const totalPages = Math.ceil(total / pageSize);

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

  // Update handleFormSubmit
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/rootbeers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  // Update handleUpdateFormSubmit
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/rootbeers/${selectedRootBeer.rootbeer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // No client-side filtering/sorting; backend handles it now
  const displayedRootBeers = rootBeers;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl text-rootbeer-700 mb-2">Root Beer Collection</h1>
        <p className="text-xl text-gray-600">Discover and explore our collection of root beers</p>
      </div>

      {/* Search and filter controls - centered row */}
      <div className="mb-12 flex justify-center w-full px-4">
  <div className="bg-rootbeer-50 rounded-xl shadow-lg p-4 w-full max-w-5xl">
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full justify-center">
      <input
        type="text"
        placeholder="Search root beers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow px-3 py-2 border-2 border-gray-200 rounded-xl 
          text-base bg-white shadow transition-all duration-200 
          focus:outline-none focus:border-rootbeer-700 focus:shadow-xl 
          w-full md:min-w-[300px] md:max-w-[600px]"
      />
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex items-center bg-white border border-rootbeer-100 
          rounded-xl shadow-sm text-sm md:text-base w-full md:w-auto">
          <span className="font-semibold text-rootbeer-700 px-4 py-2">Sort</span>
          <button
            type="button"
            className={`px-4 py-2 rounded-l-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rootbeer-400 ${
              sortBy === 'name' ? 'bg-rootbeer-700 text-white shadow' : 'text-rootbeer-700 hover:bg-rootbeer-50'
            }`}
            onClick={() => setSortBy('name')}
            style={{ borderRight: '1px solid #e5e7eb' }}
          >
            Name
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rootbeer-400 ${
              sortBy === 'rating' ? 'bg-rootbeer-700 text-white shadow' : 'text-rootbeer-700 hover:bg-rootbeer-50'
            }`}
            onClick={() => setSortBy('rating')}
            style={{ borderRight: '1px solid #e5e7eb' }}
          >
            Rating
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rootbeer-400 flex items-center gap-1 ${
              sortOrder === 'asc' ? 'text-rootbeer-700 hover:bg-rootbeer-50' : 'bg-rootbeer-700 text-white shadow'
            }`}
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending (A→Z, 0→9)' : 'Descending (Z→A, 9→0)'}
            aria-label="Toggle sort order"
          >
            {sortOrder === 'asc' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span className="text-xs">Asc</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="text-xs">Desc</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center bg-white border border-rootbeer-100 
          rounded-xl shadow-sm text-sm md:text-base w-full md:w-auto">
          <span className="font-semibold text-rootbeer-700 px-4 py-2">Type</span>
          <select
            value={filterRootbeer}
            onChange={e => setFilterRootbeer(e.target.value as 'all' | 'rootbeer' | 'notrootbeer' | 'rated')}
            className="flex-grow px-4 py-2 rounded-r-xl font-semibold transition-all duration-150 
              focus:outline-none focus:ring-2 focus:ring-rootbeer-400 
              text-rootbeer-700 border-l border-rootbeer-100"
            aria-label="Filter by type"
          >
            <option value="all">All</option>
            <option value="rootbeer">Root Beer Only</option>
            <option value="notrootbeer">Not Root Beer</option>
            <option value="rated">Reviewed</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</div>
        {user?.isAdmin && (
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

      {showUpdate && user?.isAdmin && (
        <div className="max-w-lg mx-auto mb-8 bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <label className="block font-semibold mb-1">Search Root Beer by Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Type to search..."
            />
          </div>
          {searchTerm && (
            <div className="border rounded bg-gray-50 max-h-40 overflow-y-auto">
              {displayedRootBeers
                .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(b => (
                  <div
                    key={b.rootbeer_id}
                    className={`px-3 py-2 cursor-pointer hover:bg-rootbeer-100 ${
                      selectedRootBeer?.rootbeer_id === b.rootbeer_id ? 'bg-rootbeer-200' : ''
                    }`}
                    onClick={() => handleSelectRootBeer(b)}
                  >
                    {b.name}
                  </div>
                ))}
              {displayedRootBeers.filter(b => 
                b.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
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

      {showForm && user?.isAdmin && (
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

      {/* Removed duplicate search bar here */}

      {loading && (
        <div className="text-center py-12 text-gray-600 text-lg">Loading root beers...</div>
      )}
      {error && (
        <div className="text-center py-12 text-red-500 text-lg">{error}</div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedRootBeers.map((beer) => (
              <div key={beer.rootbeer_id} className="bg-white rounded-xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl border border-gray-100">
                {beer.logo && (
                  <img src={beer.logo} alt={beer.name} className="mb-4 w-full h-40 object-contain rounded" />
                )}
                <div className="mb-4">
                  <h3 className="text-2xl text-rootbeer-700 mb-2">{beer.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-rootbeer-700 text-lg">
                  Rating: {beer.rating === 0
                    ? 'Not Rated'
                    : (beer.rating !== undefined && beer.rating !== null && !isNaN(Number(beer.rating))
                        ? parseFloat(Number(beer.rating).toFixed(2)).toString()
                        : 'N/A')}
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

          {displayedRootBeers.length === 0 && (
            <div className="text-center py-12 text-gray-600 text-lg">
              <p>No root beers found matching your search and filters.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                className="px-3 py-1 rounded border bg-white text-rootbeer-700 font-semibold disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded border font-semibold ${page === currentPage ? 'bg-rootbeer-700 text-white' : 'bg-white text-rootbeer-700'}`}
                  onClick={() => setCurrentPage(page)}
                  disabled={page === currentPage}
                >
                  {page}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded border bg-white text-rootbeer-700 font-semibold disabled:opacity-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RootBeerListPage;
