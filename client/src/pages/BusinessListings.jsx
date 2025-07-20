import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Plus } from 'lucide-react';
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
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.floor(rating) ? '#ffd700' : 'none'}
        color={i < Math.floor(rating) ? '#ffd700' : '#ddd'}
      />
    ));
  };

  if (loading && businesses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="business-listings">
      <div className="business-listings-header">
        <div className="header-content">
          <h1>Local Businesses</h1>
          <p>Discover amazing businesses in your community</p>
          {user && user.role === 'vendor' && (
            <Link to="/add-business" className="add-business-btn">
              <Plus size={20} />
              Add Your Business
            </Link>
          )}
        </div>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
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
          />

          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Alphabetical</option>
            <option value="reviewCount">Most Reviewed</option>
          </select>

          <button onClick={clearFilters} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchBusinesses}>Retry</button>
        </div>
      )}

      <div className="businesses-grid">
        {businesses.map(business => (
          <div key={business._id} className="business-card">
            <Link to={`/business/${business._id}`}>
              <div className="business-image">
                {business.images && business.images.length > 0 ? (
                  <img 
                    src={business.images[0]} 
                    alt={business.name}
                    onError={(e) => {
                      e.target.src = '/placeholder-business.svg';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <span>{business.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              
              <div className="business-info">
                <h3>{business.name}</h3>
                <p className="category">{business.category}</p>
                <p className="description">{business.description}</p>
                
                <div className="business-meta">
                  <div className="location">
                    <MapPin size={14} />
                    <span>{business.address}</span>
                  </div>
                  
                  <div className="rating">
                    <div className="stars">
                      {renderStars(business.averageRating || 0)}
                    </div>
                    <span className="rating-text">
                      {business.averageRating ? business.averageRating.toFixed(1) : 'No ratings'}
                      {business.reviewCount > 0 && ` (${business.reviewCount})`}
                    </span>
                  </div>
                </div>

                <div className="business-hours">
                  {business.hours && business.hours.today && (
                    <span className={business.isOpenNow ? 'open' : 'closed'}>
                      {business.isOpenNow ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {businesses.length === 0 && !loading && (
        <div className="no-results">
          <h3>No businesses found</h3>
          <p>Try adjusting your search criteria or check back later.</p>
          {user && user.role === 'vendor' && (
            <Link to="/add-business" className="add-business-btn">
              <Plus size={20} />
              Be the first to add a business
            </Link>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'active' : ''}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {loading && businesses.length > 0 && (
        <div className="loading-overlay">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default BusinessListings;
