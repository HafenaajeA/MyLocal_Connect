import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Star, 
  MapPin,
  User,
  Eye,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

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

  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      
      const response = await fetch(`${serverUrl}/api/admin/businesses/${businessToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBusinesses(businesses.filter(business => business._id !== businessToDelete._id));
        showNotification('Business deleted successfully', 'success');
      } else {
        const errorData = await response.json();
        showNotification(`Failed to delete business: ${errorData.message}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      showNotification('Error deleting business', 'error');
    } finally {
      setShowDeleteModal(false);
      setBusinessToDelete(null);
    }
  };

  const confirmDeleteBusiness = (business) => {
    setBusinessToDelete(business);
    setShowDeleteModal(true);
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
        showNotification(`Business ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showNotification('Failed to update business status', 'error');
      }
    } catch (error) {
      console.error('Error updating business status:', error);
      showNotification('Error updating business status', 'error');
    }
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      restaurant: 'bg-gradient-to-r from-orange-500 to-red-500',
      retail: 'bg-gradient-to-r from-blue-500 to-purple-500',
      service: 'bg-gradient-to-r from-green-500 to-emerald-500',
      health: 'bg-gradient-to-r from-pink-500 to-rose-500',
      automotive: 'bg-gradient-to-r from-gray-500 to-slate-500',
      technology: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      entertainment: 'bg-gradient-to-r from-purple-500 to-pink-500',
      education: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      other: 'bg-gradient-to-r from-gray-400 to-gray-500'
    };
    return colors[category] || colors.other;
  };

  const categories = [
    'all', 'restaurant', 'retail', 'service', 'health', 'automotive', 
    'technology', 'entertainment', 'education', 'other'
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading businesses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Management
          </h2>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg 
                       text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent transition-all duration-200 min-w-[180px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Businesses Grid */}
      <div className="grid gap-4">
        {businesses.map(business => (
          <div key={business._id} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 
                                          shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/15">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Business Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 
                              flex items-center justify-center shadow-lg">
                  {business.images && business.images.length > 0 ? (
                    <img 
                      src={business.images[0]} 
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {business.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address?.street}, {business.address?.city}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <User className="w-4 h-4" />
                    <span>{business.owner?.firstName} {business.owner?.lastName}</span>
                    <span className="text-gray-400">•</span>
                    <span>{business.owner?.email}</span>
                  </div>
                </div>
              </div>

              {/* Category and Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getCategoryBadgeColor(business.category)}`}>
                  {business.category.charAt(0).toUpperCase() + business.category.slice(1)}
                </span>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {business.averageRating ? business.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({business.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {business.isActive ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    business.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {business.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(business.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => window.open(`/business/${business._id}`, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                           text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleToggleStatus(business._id, business.isActive)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                    business.isActive
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {business.isActive ? (
                    <ToggleLeft className="w-4 h-4" />
                  ) : (
                    <ToggleRight className="w-4 h-4" />
                  )}
                  <span>{business.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  onClick={() => confirmDeleteBusiness(business)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 
                           text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                       disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                       font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                       disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg 
                       font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {businesses.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 shadow-lg text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No businesses found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              {searchTerm || categoryFilter !== 'all' 
                ? 'No businesses match your current search and filter criteria.' 
                : 'No businesses have been registered yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-md border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500/90 border-green-400 text-white' 
            : 'bg-red-500/90 border-red-400 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && businessToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 m-4 max-w-md w-full border border-white/20 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Confirm Delete
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{businessToDelete.name}</strong>? 
              This action cannot be undone and will also delete all associated reviews.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBusinessToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg 
                         font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBusiness}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                         font-medium transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement;
