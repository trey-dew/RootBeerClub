import React, { useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface definitions
interface RootBeer {
  rootbeer_id: number;
  name: string;
  rating: number;
  logo?: string;
  is_rootbeer: boolean;
  count?: number; // Number of ratings, optional
}

interface RatingInfo {
  rating_id: number;
  rootbeer_id: number;
  user_id: number;
  rating: number;
  comment: string;
}

interface JudgeInfo {
  user_id: number;
  firstname: string;
  lastname: string;
  avg_rating?: number;
  total_ratings?: number;
}

interface StatsData {
  totalRootBeers: number;
  totalRatings: number;
  avgRating: number;
  highestRated: RootBeer | null;
  lowestRated: RootBeer | null;
  mostRatings: RootBeer | null;
  judgeStats: JudgeInfo[];
  ratingDistribution: {[key: string]: number};
  isRootbeerStats: {rootbeer: number, notRootbeer: number};
}

const ClubStatsPage: React.FC = () => {
  // Fix the useTransition hook usage
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initial optimistic stats (showing placeholders)
  const initialStats: StatsData = {
    totalRootBeers: 0,
    totalRatings: 0,
    avgRating: 0,
    highestRated: null,
    lowestRated: null,
    mostRatings: null,
    judgeStats: [],
    ratingDistribution: Object.fromEntries([...Array(11)].map((_, i) => [i.toString(), 0])),
    isRootbeerStats: {rootbeer: 0, notRootbeer: 0}
  };
  
  const [stats, setStats] = useState<StatsData>(initialStats);

  // Create optimistic stats directly without a separate state
  const optimisticStats: StatsData = {
    ...initialStats,
    totalRootBeers: 15,
    totalRatings: 45,
    avgRating: 7.5,
    highestRated: {
      rootbeer_id: 0,
      name: "Loading...",
      rating: 9.5,
      is_rootbeer: true
    },
    lowestRated: {
      rootbeer_id: 0,
      name: "Loading...",
      rating: 4.2,
      is_rootbeer: true
    },
    mostRatings: {
      rootbeer_id: 0,
      name: "Loading...",
      rating: 7.8,
      is_rootbeer: true,
      count: 4
    },
    judgeStats: Array(4).fill(0).map((_, i) => ({
      user_id: i,
      firstname: "Judge",
      lastname: `${i+1}`,
      avg_rating: 7.0 + (i * 0.5),
      total_ratings: 10 + i
    })),
    ratingDistribution: {
      "0": 1, "1": 2, "2": 2, "3": 3, "4": 4, 
      "5": 6, "6": 8, "7": 10, "8": 7, "9": 4, "10": 2
    },
    isRootbeerStats: {rootbeer: 12, notRootbeer: 3}
  };

  // Use combined stats for display - real data when loaded, optimistic data during loading
  const displayStats = loading ? optimisticStats : stats;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Start data fetching
        startTransition(() => {
          // Now we're actually using startTransition to mark this as a non-urgent update
          Promise.all([
            fetch(`${API_BASE_URL}/rootbeers?all=true`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch rootbeers')),
            fetch(`${API_BASE_URL}/ratings`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch ratings')),
            fetch(`${API_BASE_URL}/users`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch judges'))
          ])
          .then(([rootbeersData, ratingsData, judgesData]) => {
            const rootbeersList = rootbeersData.data.map((beer: any) => ({
              ...beer,
              rating: beer.rating !== undefined && beer.rating !== null ? Number(beer.rating) : null
            }));
            
            calculateStats(rootbeersList, ratingsData, judgesData);
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
            setLoading(false);
          });
        });
      } catch (err) {
        console.error('Error in fetch operation:', err);
        setError('Failed to load statistics');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const calculateStats = (rootbeers: RootBeer[], ratings: RatingInfo[], judges: JudgeInfo[]) => {
    if (!rootbeers.length || !ratings.length) return;
    
    // Basic counts
    const ratedRootbeers = rootbeers.filter(rb => rb.rating !== null && rb.rating !== undefined);
    const totalRootBeers = rootbeers.length;
    const totalRatings = ratings.length;
    
    // Average rating
    const sumRatings = ratings.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = totalRatings ? parseFloat((sumRatings / totalRatings).toFixed(2)) : 0;
    
    // Highest and lowest rated
    const sortedByRating = [...ratedRootbeers].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const highestRated = sortedByRating.length ? sortedByRating[0] : null;
    const lowestRated = sortedByRating.length ? sortedByRating[sortedByRating.length - 1] : null;
    
    // Most ratings
    const rootbeerRatingCounts = rootbeers.map(rb => {
      const rbRatings = ratings.filter(r => r.rootbeer_id === rb.rootbeer_id);
      return { ...rb, count: rbRatings.length };
    });
    const sortedByRatingCount = [...rootbeerRatingCounts].sort((a, b) => b.count - a.count);
    const mostRatings = sortedByRatingCount.length ? sortedByRatingCount[0] : null;
    
    // Judge stats
    const judgeStats = judges.map(judge => {
      const judgeRatings = ratings.filter(r => r.user_id === judge.user_id);
      const totalRatings = judgeRatings.length;
      const avgRating = totalRatings
        ? parseFloat((judgeRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(2))
        : 0;
      return { ...judge, avg_rating: avgRating, total_ratings: totalRatings };
    });
    
    // Rating distribution
    const ratingDistribution: {[key: string]: number} = {};
    for (let i = 0; i <= 10; i++) {
      const roundedKey = i.toString();
      ratingDistribution[roundedKey] = ratings.filter(r => Math.floor(r.rating) === i).length;
    }
    
    // Root beer vs Not root beer stats
    const rootbeerCount = rootbeers.filter(rb => rb.is_rootbeer).length;
    const notRootbeerCount = rootbeers.filter(rb => !rb.is_rootbeer).length;
    
    setStats({
      totalRootBeers,
      totalRatings,
      avgRating,
      highestRated,
      lowestRated,
      mostRatings,
      judgeStats,
      ratingDistribution,
      isRootbeerStats: {
        rootbeer: rootbeerCount,
        notRootbeer: notRootbeerCount
      }
    });
  };

  // Use isPending to show loading states
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-rootbeer-700 mb-8 text-center">
        Club Statistics
      </h1>
      
      {/* Use isPending for loading indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 bg-rootbeer-700 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Updating statistics...
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}
      
      {/* Overview Stats - now using displayStats and isPending */}
      <div className={`bg-white rounded-xl shadow-lg p-6 mb-8 transition-opacity duration-500 ${isPending ? 'opacity-80' : 'opacity-100'}`}>
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">
              {displayStats.totalRootBeers}
              {isPending && <span className="inline-block ml-2 animate-pulse">*</span>}
            </p>
            <p className="text-lg text-rootbeer-600">Root Beers</p>
          </div>
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">
              {displayStats.totalRatings}
              {isPending && <span className="inline-block ml-2 animate-pulse">*</span>}
            </p>
            <p className="text-lg text-rootbeer-600">Total Ratings</p>
          </div>
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">
              {displayStats.avgRating}
              {isPending && <span className="inline-block ml-2 animate-pulse">*</span>}
            </p>
            <p className="text-lg text-rootbeer-600">Average Rating</p>
          </div>
        </div>
      </div>
      
      {/* Notable Root Beers */}
      <div className={`bg-white rounded-xl shadow-lg p-6 mb-8 transition-opacity duration-500 ${isPending ? 'opacity-80' : 'opacity-100'}`}>
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Notable Root Beers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayStats.highestRated && (
            <Link 
              to={loading ? '#' : `/rootbeers/${displayStats.highestRated.rootbeer_id}`}
              className={`bg-rootbeer-50 p-6 rounded-lg text-center ${loading ? 'pointer-events-none' : 'hover:bg-rootbeer-100'} transition-colors`}
            >
              <p className="font-medium text-rootbeer-600 mb-2">Highest Rated</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">
                {displayStats.highestRated.name}
                {loading && <span className="inline-block ml-2 animate-pulse">*</span>}
              </p>
              <p className="text-rootbeer-600">{displayStats.highestRated.rating}</p>
            </Link>
          )}
          
          {displayStats.lowestRated && (
            <Link 
              to={loading ? '#' : `/rootbeers/${displayStats.lowestRated.rootbeer_id}`}
              className={`bg-rootbeer-50 p-6 rounded-lg text-center ${loading ? 'pointer-events-none' : 'hover:bg-rootbeer-100'} transition-colors`}
            >
              <p className="font-medium text-rootbeer-600 mb-2">Lowest Rated</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">
                {displayStats.lowestRated.name}
                {loading && <span className="inline-block ml-2 animate-pulse">*</span>}
              </p>
              <p className="text-rootbeer-600">{displayStats.lowestRated.rating}</p>
            </Link>
          )}
          
          {displayStats.mostRatings && (
            <Link 
              to={loading ? '#' : `/rootbeers/${displayStats.mostRatings.rootbeer_id}`}
              className={`bg-rootbeer-50 p-6 rounded-lg text-center ${loading ? 'pointer-events-none' : 'hover:bg-rootbeer-100'} transition-colors`}
            >
              <p className="font-medium text-rootbeer-600 mb-2">Most Reviews</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">
                {displayStats.mostRatings.name}
                {loading && <span className="inline-block ml-2 animate-pulse">*</span>}
              </p>
              <p className="text-rootbeer-600">{displayStats.mostRatings.count} ratings</p>
            </Link>
          )}
        </div>
      </div>
      
      {/* Judge Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Judge Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-rootbeer-100 text-rootbeer-700">
                <th className="py-3 px-4 text-left">Judge</th>
                <th className="py-3 px-4 text-right">Ratings Given</th>
                <th className="py-3 px-4 text-right">Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {displayStats.judgeStats.map((judge) => (
                <tr key={judge.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link to={`/judges/${judge.user_id}`} className="text-rootbeer-700 hover:text-rootbeer-900">
                      {judge.firstname} {judge.lastname}
                      {isPending && <span className="inline-block ml-1 animate-pulse text-xs">*</span>}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right">{judge.total_ratings}</td>
                  <td className="py-3 px-4 text-right">{judge.avg_rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Rating Distribution
        </h2>
        <div className="h-64">
          <div className="flex h-full items-end">
            {Object.keys(displayStats.ratingDistribution)
              .sort((a, b) => Number(a) - Number(b))
              .map((rating) => {
                const count = displayStats.ratingDistribution[rating];
                const maxCount = Math.max(...Object.values(displayStats.ratingDistribution));
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div 
                    key={rating} 
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="text-xs text-rootbeer-600 mb-1">{count}</div>
                    <div 
                      className={`w-full ${isPending ? 'bg-rootbeer-400' : 'bg-rootbeer-500'}`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <div className="text-xs mt-2">{rating}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      
      {/* Root Beer vs Not Root Beer */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Beverages by Type
        </h2>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="inline-block w-32 h-32 rounded-full bg-rootbeer-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {displayStats.isRootbeerStats.rootbeer}
                {isPending && <span className="inline-block ml-1 animate-pulse text-xs">*</span>}
              </span>
            </div>
            <p className="mt-3 text-lg text-rootbeer-700">Root Beer</p>
          </div>
          <div className="text-center">
            <div className="inline-block w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {displayStats.isRootbeerStats.notRootbeer}
                {isPending && <span className="inline-block ml-1 animate-pulse text-xs">*</span>}
              </span>
            </div>
            <p className="mt-3 text-lg text-gray-600">Not Root Beer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubStatsPage;