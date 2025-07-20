import React, { useState, useEffect } from 'react';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filterStatus, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : ''
      });

      const response = await fetch(`${serverUrl}/api/admin/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        alert('Review deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete review: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const handleToggleReviewStatus = async (reviewId, currentStatus) => {
    const newStatus = currentStatus === 'approved' ? 'flagged' : 'approved';
    
    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus 
        })
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review._id === reviewId 
            ? { ...review, status: newStatus }
            : review
        ));
        alert(`Review ${newStatus} successfully`);
      } else {
        alert('Failed to update review status');
      }
    } catch (error) {
      console.error('Error updating review status:', error);
      alert('Error updating review status');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'active';
      case 'flagged': return 'inactive';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="review-management">
      <div className="management-header">
        <h2>Review Management</h2>
        <div className="management-controls">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Review</th>
              <th>Business</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review._id}>
                <td>
                  <div className="review-content">
                    {review.title && (
                      <div className="review-title">{review.title}</div>
                    )}
                    <div className="review-text">
                      {review.comment.length > 100 
                        ? `${review.comment.substring(0, 100)}...` 
                        : review.comment
                      }
                    </div>
                    {review.reportCount > 0 && (
                      <div className="report-info">
                        ⚠️ Reported {review.reportCount} times
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="business-info">
                    <div className="business-name">
                      {review.business?.name || 'Deleted Business'}
                    </div>
                    <div className="business-category">
                      {review.business?.category}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="reviewer-info">
                    <div className="reviewer-name">
                      {review.user?.firstName} {review.user?.lastName}
                    </div>
                    <div className="reviewer-email">
                      {review.user?.email}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="rating-display">
                    <span className="stars">{renderStars(review.rating)}</span>
                    <span className="rating-number">({review.rating}/5)</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(review.status)}`}>
                    {review.status || 'approved'}
                  </span>
                </td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions">
                    <button
                      className="admin-btn view"
                      onClick={() => window.open(`/business/${review.business?._id}`, '_blank')}
                      disabled={!review.business}
                    >
                      View Business
                    </button>
                    <button
                      className={`admin-btn ${(review.status || 'approved') === 'approved' ? 'delete' : 'view'}`}
                      onClick={() => handleToggleReviewStatus(review._id, review.status || 'approved')}
                    >
                      {(review.status || 'approved') === 'approved' ? 'Flag' : 'Approve'}
                    </button>
                    <button
                      className="admin-btn delete"
                      onClick={() => handleDeleteReview(review._id)}
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

export default ReviewManagement;
