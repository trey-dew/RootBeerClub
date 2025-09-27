import React, { useEffect, useState } from 'react';
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
  const [rootbeers, setRootbeers] = useState<RootBeer[]>([]);
  const [ratings, setRatings] = useState<RatingInfo[]>([]);
  const [judges, setJudges] = useState<JudgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalRootBeers: 0,
    totalRatings: 0,
    avgRating: 0,
    highestRated: null,
    lowestRated: null,
    mostRatings: null,
    judgeStats: [],
    ratingDistribution: {},
    isRootbeerStats: {rootbeer: 0, notRootbeer: 0}
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all rootbeers
        const rootbeersRes = await fetch(`${API_BASE_URL}/rootbeers?all=true`);
        if (!rootbeersRes.ok) throw new Error('Failed to fetch rootbeers');
        const rootbeersData = await rootbeersRes.json();
        const rootbeersList = rootbeersData.data.map((beer: any) => ({
          ...beer,
          rating: beer.rating !== undefined && beer.rating !== null ? Number(beer.rating) : null
        }));
        setRootbeers(rootbeersList);
        
        // Fetch all ratings
        const ratingsRes = await fetch(`${API_BASE_URL}/ratings`);
        if (!ratingsRes.ok) throw new Error('Failed to fetch ratings');
        const ratingsData = await ratingsRes.json();
        setRatings(ratingsData);
        
        // Fetch all judges
        const judgesRes = await fetch(`${API_BASE_URL}/users`);
        if (!judgesRes.ok) throw new Error('Failed to fetch judges');
        const judgesData = await judgesRes.json();
        setJudges(judgesData);
        
        // Calculate stats
        calculateStats(rootbeersList, ratingsData, judgesData);
      } catch (err) {
        console.error('Error fetching stats data:', err);
        setError('Failed to load statistics');
      } finally {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-rootbeer-700 mb-6">Club Statistics</h1>
        <div className="text-xl text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-rootbeer-700 mb-6">Club Statistics</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-rootbeer-700 mb-8 text-center">
        Club Statistics
      </h1>
      
      {/* Overview Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">{stats.totalRootBeers}</p>
            <p className="text-lg text-rootbeer-600">Root Beers</p>
          </div>
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">{stats.totalRatings}</p>
            <p className="text-lg text-rootbeer-600">Total Ratings</p>
          </div>
          <div className="bg-rootbeer-50 p-6 rounded-lg text-center">
            <p className="text-4xl font-bold text-rootbeer-700 mb-2">{stats.avgRating}</p>
            <p className="text-lg text-rootbeer-600">Average Rating</p>
          </div>
        </div>
      </div>
      
      {/* Notable Root Beers */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl text-rootbeer-700 mb-6 text-center">
          Notable Root Beers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.highestRated && (
            <Link 
              to={`/rootbeers/${stats.highestRated.rootbeer_id}`}
              className="bg-rootbeer-50 p-6 rounded-lg text-center hover:bg-rootbeer-100 transition-colors"
            >
              <p className="font-medium text-rootbeer-600 mb-2">Highest Rated</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">{stats.highestRated.name}</p>
              <p className="text-rootbeer-600">{stats.highestRated.rating}</p>
            </Link>
          )}
          
          {stats.lowestRated && (
            <Link 
              to={`/rootbeers/${stats.lowestRated.rootbeer_id}`}
              className="bg-rootbeer-50 p-6 rounded-lg text-center hover:bg-rootbeer-100 transition-colors"
            >
              <p className="font-medium text-rootbeer-600 mb-2">Lowest Rated</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">{stats.lowestRated.name}</p>
              <p className="text-rootbeer-600">{stats.lowestRated.rating}</p>
            </Link>
          )}
          
          {stats.mostRatings && (
            <Link 
              to={`/rootbeers/${stats.mostRatings.rootbeer_id}`}
              className="bg-rootbeer-50 p-6 rounded-lg text-center hover:bg-rootbeer-100 transition-colors"
            >
              <p className="font-medium text-rootbeer-600 mb-2">Most Reviews</p>
              <p className="text-xl font-bold text-rootbeer-700 mb-1">{stats.mostRatings.name}</p>
              <p className="text-rootbeer-600">{stats.mostRatings.count} ratings</p>
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
              {stats.judgeStats.map((judge) => (
                <tr key={judge.user_id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link to={`/judges/${judge.user_id}`} className="text-rootbeer-700 hover:text-rootbeer-900">
                      {judge.firstname} {judge.lastname}
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
            {Object.keys(stats.ratingDistribution)
              .sort((a, b) => Number(a) - Number(b))
              .map((rating) => {
                const count = stats.ratingDistribution[rating];
                const maxCount = Math.max(...Object.values(stats.ratingDistribution));
                const heightPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div 
                    key={rating} 
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="text-xs text-rootbeer-600 mb-1">{count}</div>
                    <div 
                      className="w-full bg-rootbeer-500"
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
              <span className="text-2xl font-bold text-white">{stats.isRootbeerStats.rootbeer}</span>
            </div>
            <p className="mt-3 text-lg text-rootbeer-700">Root Beer</p>
          </div>
          <div className="text-center">
            <div className="inline-block w-32 h-32 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{stats.isRootbeerStats.notRootbeer}</span>
            </div>
            <p className="mt-3 text-lg text-gray-600">Not Root Beer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubStatsPage;