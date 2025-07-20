import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Eye, Flag, Check, Trash2, 
  AlertTriangle, Calendar, User, Building2, MessageCircle,
  ChevronLeft, ChevronRight, MoreVertical, ExternalLink
} from 'lucide-react';

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
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? '#ffd700' : 'none'}
        color={i < rating ? '#ffd700' : '#e5e5e5'}
        className="inline"
      />
    ));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: Check,
          label: 'Approved'
        };
      case 'flagged': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: Flag,
          label: 'Flagged'
        };
      case 'pending': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: AlertTriangle,
          label: 'Pending'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: AlertTriangle,
          label: 'Unknown'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              Review Management
            </h2>
            <p className="text-gray-600">Monitor and moderate user reviews across your platform</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 w-full sm:w-64"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="all">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => {
            const statusConfig = getStatusConfig(review.status || 'approved');
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={review._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Review Content - 5 columns */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {review.title && (
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{review.title}</h3>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-600">({review.rating}/5)</span>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig.label}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {review.comment.length > 150 
                          ? `${review.comment.substring(0, 150)}...` 
                          : review.comment
                        }
                      </p>
                      
                      {review.reportCount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className="text-red-700 text-sm font-medium">
                            Reported {review.reportCount} times
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Business Info - 3 columns */}
                    <div className="lg:col-span-3 space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Business</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {review.business?.name || 'Deleted Business'}
                        </h4>
                        {review.business?.category && (
                          <p className="text-sm text-gray-600 capitalize">
                            {review.business.category}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reviewer Info - 2 columns */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">Reviewer</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {review.user?.firstName} {review.user?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {review.user?.email}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-500 text-sm justify-center">
                          <Calendar className="w-4 h-4" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions - 2 columns */}
                    <div className="lg:col-span-2 flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => window.open(`/business/${review.business?._id}`, '_blank')}
                        disabled={!review.business}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Business
                      </button>
                      
                      <button
                        onClick={() => handleToggleReviewStatus(review._id, review.status || 'approved')}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          (review.status || 'approved') === 'approved' 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {(review.status || 'approved') === 'approved' ? (
                          <>
                            <Flag className="w-4 h-4" />
                            Flag Review
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Approve
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Reviews Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No reviews have been submitted yet.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
