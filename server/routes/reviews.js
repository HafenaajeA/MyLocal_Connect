import express from 'express';
import Review from '../models/Review.js';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Get all reviews for a business
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      rating 
    } = req.query;

    // Build filter
    const filter = { 
      business: businessId, 
      isHidden: false 
    };
    
    if (rating) {
      filter.rating = rating;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    // Get business stats
    const businessStats = await Review.getBusinessStats(businessId);

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      businessStats
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ 
      message: 'Error fetching reviews', 
      error: error.message 
    });
  }
});

// Get all reviews by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ 
      user: userId, 
      isHidden: false 
    })
      .populate('business', 'name address.city images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReviews = await Review.countDocuments({ 
      user: userId, 
      isHidden: false 
    });
    
    const totalPages = Math.ceil(totalReviews / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalReviews,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ 
      message: 'Error fetching user reviews', 
      error: error.message 
    });
  }
});

// Get a specific review
router.get('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('user', 'firstName lastName avatar')
      .populate('business', 'name address images');

    if (!review || review.isHidden) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ 
      message: 'Error fetching review', 
      error: error.message 
    });
  }
});

// Create a new review (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { business, rating, comment, title } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!business || !rating || !comment) {
      return res.status(400).json({ 
        message: 'Business ID, rating, and comment are required' 
      });
    }

    // Check if business exists
    const businessExists = await Business.findById(business);
    if (!businessExists) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Check if user can review this business
    const canReview = await Review.canUserReview(userId, business);
    if (!canReview) {
      return res.status(409).json({ 
        message: 'You have already reviewed this business. You can update your existing review instead.' 
      });
    }

    // Create new review
    const newReview = new Review({
      user: userId,
      business,
      rating: parseFloat(rating),
      comment: comment.trim(),
      title: title ? title.trim() : ''
    });

    await newReview.save();

    // Populate the review before sending response
    const populatedReview = await Review.findById(newReview._id)
      .populate('user', 'firstName lastName avatar')
      .populate('business', 'name address');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.code === 'DUPLICATE_REVIEW' || error.code === 11000) {
      return res.status(409).json({ 
        message: 'You have already reviewed this business. You can update your existing review instead.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating review', 
      error: error.message 
    });
  }
});

// Update a review (only the review author)
router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, title } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({ 
        message: 'You can only update your own reviews' 
      });
    }

    // Update fields if provided
    if (rating !== undefined) {
      review.rating = parseFloat(rating);
    }
    if (comment !== undefined) {
      review.comment = comment.trim();
    }
    if (title !== undefined) {
      review.title = title.trim();
    }

    await review.save();

    // Populate the updated review
    const updatedReview = await Review.findById(reviewId)
      .populate('user', 'firstName lastName avatar')
      .populate('business', 'name address');

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ 
      message: 'Error updating review', 
      error: error.message 
    });
  }
});

// Delete a review (only the review author or admin)
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is an admin
    if (review.user.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'You can only delete your own reviews' 
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ 
      message: 'Error deleting review', 
      error: error.message 
    });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review || review.isHidden) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.markHelpful();

    res.json({ 
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({ 
      message: 'Error marking review as helpful', 
      error: error.message 
    });
  }
});

// Report a review
router.post('/:reviewId/report', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.reportReview(userId, reason);

    res.json({ message: 'Review reported successfully' });
  } catch (error) {
    console.error('Error reporting review:', error);
    
    if (error.message.includes('already reported')) {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: 'Error reporting review', 
      error: error.message 
    });
  }
});

// Check if user can review a business
router.get('/check/:businessId', authMiddleware, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    const canReview = await Review.canUserReview(userId, businessId);
    
    res.json({ 
      canReview,
      message: canReview ? 'You can review this business' : 'You have already reviewed this business'
    });
  } catch (error) {
    console.error('Error checking review permission:', error);
    res.status(500).json({ 
      message: 'Error checking review permission', 
      error: error.message 
    });
  }
});

// Get business statistics
router.get('/stats/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const stats = await Review.getBusinessStats(businessId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching business stats:', error);
    res.status(500).json({ 
      message: 'Error fetching business stats', 
      error: error.message 
    });
  }
});

// Admin routes for managing reviews
router.put('/:reviewId/hide', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { moderatorNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        isHidden: true,
        moderatorNotes: moderatorNotes || ''
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ 
      message: 'Review hidden successfully',
      review 
    });
  } catch (error) {
    console.error('Error hiding review:', error);
    res.status(500).json({ 
      message: 'Error hiding review', 
      error: error.message 
    });
  }
});

router.put('/:reviewId/unhide', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        isHidden: false,
        moderatorNotes: ''
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ 
      message: 'Review unhidden successfully',
      review 
    });
  } catch (error) {
    console.error('Error unhiding review:', error);
    res.status(500).json({ 
      message: 'Error unhiding review', 
      error: error.message 
    });
  }
});

export default router;
