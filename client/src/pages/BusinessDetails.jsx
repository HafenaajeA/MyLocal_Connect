import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Phone, Globe, Clock, Star, Edit, MessageCircle,
  Camera, Share2, Heart, Flag, ChevronLeft, ChevronRight
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
        fill={i < rating ? '#ffd700' : 'none'}
        color={i < rating ? '#ffd700' : '#ddd'}
        className={interactive ? 'interactive-star' : ''}
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
    return <LoadingSpinner />;
  }

  if (error || !business) {
    return (
      <div className="error-page">
        <h2>Business Not Found</h2>
        <p>{error || 'The business you are looking for does not exist.'}</p>
        <button onClick={() => navigate('/businesses')} className="back-button">
          Back to Businesses
        </button>
      </div>
    );
  }

  const isOwner = user && business.owner && business.owner._id === user.id;
  const canEdit = isOwner || (user && user.role === 'admin');

  return (
    <div className="business-details">
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

          {/* Services */}
          {business.services && business.services.length > 0 && (
            <div className="services-info">
              <h3>Services</h3>
              <div className="services-list">
                {business.services.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
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
