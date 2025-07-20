import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Globe, Clock, Star, Edit, MessageCircle,
  Camera, Share2, Heart, Flag, ChevronLeft, ChevronRight,
  ArrowLeft, Calendar, Users, Shield, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';


const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchBusinessDetails();
    fetchReviews();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}`
      );

      if (!response.ok) {
        throw new Error('Business not found');
      }

      const data = await response.json();
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching business:', error);
      setError('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/reviews?businessId=${id}&limit=10`
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            business: id,
            ...newReview
          })
        }
      );

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', comment: '' });
        fetchReviews();
        fetchBusinessDetails(); // Refresh to update rating
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/businesses/${id}/favorite`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const shareBusiness = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={interactive ? 24 : 16}
        fill={i < rating ? '#fbbf24' : 'none'}
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
        onClick={interactive ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Business Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The business you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/businesses')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Businesses</span>
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && business.owner && business.owner._id === user.id;
  const canEdit = isOwner || (user && user.role === 'admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Image Gallery */}
      {business.images && business.images.length > 0 && (
        <div className="relative mb-8">
          <div className="relative h-96 bg-gray-200">
            <img 
              src={business.images[currentImageIndex]} 
              alt={business.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-business.jpg';
              }}
            />
            {business.images.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === 0 ? business.images.length - 1 : currentImageIndex - 1
                  )}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white/90 transition-all duration-200"
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === business.images.length - 1 ? 0 : currentImageIndex + 1
                  )}
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {business.images.length}
            </div>
          </div>
          {business.images.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2 px-4 overflow-x-auto pb-2">
              {business.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${business.name} ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Business Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-800">{business.name}</h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {business.category}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(business.averageRating || 0)}
                    <span className="text-gray-600 ml-2">
                      {business.averageRating ? business.averageRating.toFixed(1) : 'No ratings'}
                      {business.reviewCount > 0 && ` (${business.reviewCount} reviews)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{business.address}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {canEdit && (
                  <Link 
                    to={`/edit-business/${business._id}`} 
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-lg font-medium transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                )}
                
                <button 
                  onClick={toggleFavorite} 
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isFavorite 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Favorited' : 'Save'}</span>
                </button>
                
                <button 
                  onClick={shareBusiness} 
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-all duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {user && (
                  <Link 
                    to={`/chat?business=${business._id}`} 
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              </div>

              {/* Services */}
              {business.services && business.services.length > 0 && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h2>
                  {user && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      <Star className="w-4 h-4" />
                      <span>Write Review</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-6 mb-8 p-6 bg-gray-50/50 rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-1">
                      {business.averageRating ? business.averageRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                      {renderStars(business.averageRating || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {business.reviewCount || 0} reviews
                    </div>
                  </div>
                </div>

                {/* Review Form */}
                {showReviewForm && user && (
                  <div className="mb-8 p-6 bg-blue-50/50 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center space-x-1">
                          {renderStars(newReview.rating, true, (rating) => 
                            setNewReview({ ...newReview, rating })
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Give your review a title"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                          placeholder="Share your experience"
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review._id} className="p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {review.user 
                                ? `${review.user.firstName?.charAt(0) || ''}${review.user.lastName?.charAt(0) || ''}`
                                : 'A'
                              }
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No reviews yet</p>
                      <p className="text-sm">Be the first to review this business!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Phone className="w-5 h-5" />
                  <span>Contact</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">{business.address}</span>
                  </div>
                  
                  {business.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {business.phone}
                      </a>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Hours */}
              {business.hours && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Hours</span>
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(business.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center">
                        <span className="font-medium text-gray-700 capitalize">{day}</span>
                        <span className="text-gray-600">{hours || 'Closed'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      {/* Image Gallery */}
      {business.images && business.images.length > 0 && (
        <div className="image-gallery">
          <div className="main-image">
            <img 
              src={business.images[currentImageIndex]} 
              alt={business.name}
              onError={(e) => {
                e.target.src = '/placeholder-business.jpg';
              }}
            />
            {business.images.length > 1 && (
              <>
                <button 
                  className="nav-button prev"
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === 0 ? business.images.length - 1 : currentImageIndex - 1
                  )}
                >
                  <ChevronLeft />
                </button>
                <button 
                  className="nav-button next"
                  onClick={() => setCurrentImageIndex(
                    currentImageIndex === business.images.length - 1 ? 0 : currentImageIndex + 1
                  )}
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
          {business.images.length > 1 && (
            <div className="image-thumbnails">
              {business.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${business.name} ${index + 1}`}
                  className={index === currentImageIndex ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Business Header */}
      <div className="business-header">
        <div className="business-title">
          <h1>{business.name}</h1>
          <span className="category">{business.category}</span>
        </div>

        <div className="business-actions">
          {canEdit && (
            <Link to={`/edit-business/${business._id}`} className="action-button edit">
              <Edit size={20} />
              Edit
            </Link>
          )}
          <button onClick={toggleFavorite} className={`action-button ${isFavorite ? 'favorited' : ''}`}>
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Favorited' : 'Save'}
          </button>
          <button onClick={shareBusiness} className="action-button">
            <Share2 size={20} />
            Share
          </button>
          {user && (
            <Link to={`/chat?business=${business._id}`} className="action-button chat">
              <MessageCircle size={20} />
              Chat
            </Link>
          )}
        </div>
      </div>

      {/* Business Info */}
      <div className="business-content">
        <div className="main-content">
          {/* Description */}
          <section className="business-description">
            <h2>About</h2>
            <p>{business.description}</p>
          </section>

          {/* Rating & Reviews */}
          <section className="rating-section">
            <h2>Reviews & Ratings</h2>
            <div className="rating-summary">
              <div className="overall-rating">
                <span className="rating-number">
                  {business.averageRating ? business.averageRating.toFixed(1) : 'No ratings'}
                </span>
                <div className="stars">
                  {renderStars(business.averageRating || 0)}
                </div>
                <span className="review-count">
                  {business.reviewCount || 0} reviews
                </span>
              </div>
              
              {user && !isOwner && (
                <button 
                  className="write-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form className="review-form" onSubmit={submitReview}>
                <h3>Write a Review</h3>
                <div className="rating-input">
                  <label>Rating:</label>
                  <div className="stars">
                    {renderStars(newReview.rating, true, (rating) => 
                      setNewReview({ ...newReview, rating })
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Review title"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Tell others about your experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  rows={4}
                  required
                />
                <div className="form-actions">
                  <button type="submit" className="submit-btn">Submit Review</button>
                  <button 
                    type="button" 
                    onClick={() => setShowReviewForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              {reviewsLoading ? (
                <LoadingSpinner />
              ) : reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">
                          {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
                        </span>
                        <div className="stars">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                    <h4>{review.title}</h4>
                    <p>{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Contact Info */}
          <div className="contact-info">
            <h3>Contact Information</h3>
            
            <div className="contact-item">
              <MapPin size={18} />
              <span>{business.address}</span>
            </div>
            
            {business.phone && (
              <div className="contact-item">
                <Phone size={18} />
                <a href={`tel:${business.phone}`}>{business.phone}</a>
              </div>
            )}
            
            {business.website && (
              <div className="contact-item">
                <Globe size={18} />
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Hours */}
          {business.hours && (
            <div className="hours-info">
              <h3>Hours</h3>
              <div className="hours-list">
                {Object.entries(business.hours).map(([day, hours]) => (
                  <div key={day} className="hours-item">
                    <span className="day">{day}</span>
                    <span className="time">{hours || 'Closed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
