import React, { useState, useEffect } from 'react';

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBusinesses();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : ''
      });

      const response = await fetch(`${serverUrl}/api/admin/businesses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm('Are you sure you want to delete this business? This action cannot be undone and will also delete all associated reviews.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/businesses/${businessId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBusinesses(businesses.filter(business => business._id !== businessId));
        alert('Business deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete business: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Error deleting business');
    }
  };

  const handleToggleStatus = async (businessId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/businesses/${businessId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive: !currentStatus 
        })
      });

      if (response.ok) {
        setBusinesses(businesses.map(business => 
          business._id === businessId 
            ? { ...business, isActive: !currentStatus }
            : business
        ));
        alert(`Business ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert('Failed to update business status');
      }
    } catch (error) {
      console.error('Error updating business status:', error);
      alert('Error updating business status');
    }
  };

  const categories = [
    'all', 'restaurant', 'retail', 'service', 'health', 'automotive', 
    'technology', 'entertainment', 'education', 'other'
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="business-management">
      <div className="management-header">
        <h2>Business Management</h2>
        <div className="management-controls">
          <input
            type="text"
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Owner</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map(business => (
              <tr key={business._id}>
                <td>
                  <div className="business-info">
                    {business.images && business.images.length > 0 ? (
                      <img 
                        src={business.images[0]} 
                        alt={business.name}
                        className="business-image"
                      />
                    ) : (
                      <div className="business-placeholder">
                        {business.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="business-name">{business.name}</div>
                      <div className="business-address">
                        {business.address?.street}, {business.address?.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="owner-info">
                    <div>{business.owner?.firstName} {business.owner?.lastName}</div>
                    <div className="owner-email">{business.owner?.email}</div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">
                    {business.category}
                  </span>
                </td>
                <td>
                  <div className="rating-info">
                    <span className="rating-value">
                      {business.averageRating ? business.averageRating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="rating-stars">⭐</span>
                    <div className="rating-count">
                      ({business.totalReviews || 0} reviews)
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${business.isActive ? 'active' : 'inactive'}`}>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(business.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      className="admin-btn view"
                      onClick={() => window.open(`/business/${business._id}`, '_blank')}
                    >
                      View
                    </button>
                    <button
                      className={`admin-btn ${business.isActive ? 'delete' : 'view'}`}
                      onClick={() => handleToggleStatus(business._id, business.isActive)}
                    >
                      {business.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="admin-btn delete"
                      onClick={() => handleDeleteBusiness(business._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
