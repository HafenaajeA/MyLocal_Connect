import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { postService } from '../services/postService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    page: 1
  });

  const { data, isLoading, error } = useQuery(
    ['posts', filters],
    () => postService.getPosts(filters),
    {
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading posts</div>;

  return (
    <div className="container py-4">
      <div className="home-header">
        <h1 className="text-2xl font-bold mb-4">Community Posts</h1>
        
        {/* Filters */}
        <div className="filters-section card card-padding mb-4">
          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="general">General</option>
                <option value="events">Events</option>
                <option value="business">Business</option>
                <option value="services">Services</option>
                <option value="community">Community</option>
                <option value="news">News</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="posts-section">
        {data?.posts?.length > 0 ? (
          <>
            <div className="grid grid-cols-1">
              {data.posts.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {data.pagination.current} of {data.pagination.pages}
                </span>
                
                <button
                  className="btn btn-secondary"
                  disabled={filters.page === data.pagination.pages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-posts">
            <h3>No posts found</h3>
            <p>Be the first to share something with your community!</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .filters-grid {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 16px;
          align-items: end;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 32px;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 14px;
        }

        .no-posts {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .no-posts h3 {
          margin-bottom: 8px;
          color: #374151;
        }

        @media (max-width: 640px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
