import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Plus, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const BusinessListings = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const categories = [
    'Restaurant', 'Retail', 'Service', 'Healthcare', 'Technology',
    'Education', 'Entertainment', 'Fitness', 'Beauty', 'Automotive'
  ];

  useEffect(() => {
    fetchBusinesses();
  }, [filters, currentPage]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/businesses?${queryParams}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Failed to load businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      rating: '',
      sortBy: 'createdAt'
    });
    setSearchParams({});
    setCurrentPage(1);
    setShowFilters(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={`${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        } transition-colors`}
      />
    ));
  };

  const getCategoryColor = (category) => {
    const colors = {
      Restaurant: 'bg-red-100 text-red-700 border-red-200',
      Retail: 'bg-blue-100 text-blue-700 border-blue-200',
      Service: 'bg-green-100 text-green-700 border-green-200',
      Healthcare: 'bg-purple-100 text-purple-700 border-purple-200',
      Technology: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      Education: 'bg-orange-100 text-orange-700 border-orange-200',
      Entertainment: 'bg-pink-100 text-pink-700 border-pink-200',
      Fitness: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Beauty: 'bg-rose-100 text-rose-700 border-rose-200',
      Automotive: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Local Businesses
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover amazing businesses in your community
            </p>
            {user && user.role === 'vendor' && (
              <Link 
                to="/add-business" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                <Plus size={20} />
                Add Your Business
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 mb-8 shadow-lg">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search businesses..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Filter size={20} />
              Filters
              {Object.values(filters).some(v => v && v !== 'createdAt') && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>
            
            {Object.values(filters).some(v => v && v !== 'createdAt') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Filters Grid */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />

              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="createdAt">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Alphabetical</option>
                <option value="reviewCount">Most Reviewed</option>
              </select>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-red-700 font-medium">{error}</p>
              <button 
                onClick={fetchBusinesses}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!loading && businesses.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {businesses.length} businesses
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>
        )}

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {businesses.map(business => (
            <Link 
              key={business._id} 
              to={`/business/${business._id}`}
              className="group block"
            >
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Business Image */}
                <div className="relative h-48 overflow-hidden">
                  {business.images && business.images.length > 0 ? (
                    <img 
                      src={business.images[0]} 
                      alt={business.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-business.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-blue-600">
                        {business.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getCategoryColor(business.category)}`}>
                      {business.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {business.hours && business.hours.today && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        business.isOpenNow 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        <Clock size={10} className="inline mr-1" />
                        {business.isOpenNow ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {business.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-500 mb-3">
                    <MapPin size={16} />
                    <span className="text-sm truncate">{business.address}</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(business.averageRating || 0)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {business.averageRating ? business.averageRating.toFixed(1) : 'No ratings'}
                        {business.reviewCount > 0 && ` (${business.reviewCount})`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {businesses.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No businesses found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later.
              </p>
              {user && user.role === 'vendor' && (
                <Link 
                  to="/add-business" 
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={20} />
                  Be the first to add a business
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && businesses.length > 0 && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <LoadingSpinner />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessListings;
