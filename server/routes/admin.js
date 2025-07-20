import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Review from '../models/Review.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin-only middleware
const adminOnly = [authMiddleware, roleMiddleware(['admin'])];

// Get admin dashboard statistics
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get total counts
    const [
      totalUsers,
      totalVendors,
      totalBusinesses,
      totalReviews,
      newUsersThisMonth,
      newBusinessesThisMonth,
      flaggedReviews
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'vendor' }),
      Business.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Business.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      Review.countDocuments({ status: 'flagged' })
    ]);

    // Mock active chats count (would need chat implementation)
    const activeChats = 0;

    const stats = {
      totalUsers,
      totalVendors,
      totalBusinesses,
      totalReviews,
      newUsersThisMonth,
      newBusinessesThisMonth,
      flaggedReviews,
      activeChats
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Management Routes

// Get all users with pagination and filtering
router.get('/users', adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, role } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalPages,
      currentPage: page,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting other admins or themselves
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    if (userToDelete._id.toString() === req.user.userId) {
      return res.status(403).json({ message: 'Cannot delete yourself' });
    }

    // Delete user's businesses and reviews
    await Promise.all([
      Business.deleteMany({ owner: userId }),
      Review.deleteMany({ user: userId })
    ]);

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:userId/status', adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Business Management Routes

// Get all businesses with pagination and filtering
router.get('/businesses', adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, category } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const [businesses, totalBusinesses] = await Promise.all([
      Business.find(filter)
        .populate('owner', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Business.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalBusinesses / limit);

    res.json({
      businesses,
      totalPages,
      currentPage: page,
      totalBusinesses
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete business
router.delete('/businesses/:businessId', adminOnly, async (req, res) => {
  try {
    const { businessId } = req.params;

    // Delete all reviews for this business
    await Review.deleteMany({ business: businessId });

    // Delete the business
    const deletedBusiness = await Business.findByIdAndDelete(businessId);

    if (!deletedBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business and associated reviews deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update business status (activate/deactivate)
router.patch('/businesses/:businessId/status', adminOnly, async (req, res) => {
  try {
    const { businessId } = req.params;
    const { isActive } = req.body;

    const business = await Business.findByIdAndUpdate(
      businessId,
      { isActive },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json({ message: 'Business status updated successfully', business });
  } catch (error) {
    console.error('Error updating business status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review Management Routes

// Get all reviews with pagination and filtering
router.get('/reviews', adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.status = status;
    }

    const [reviews, totalReviews] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName email')
        .populate('business', 'name category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      reviews,
      totalPages,
      currentPage: page,
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete review
router.delete('/reviews/:reviewId', adminOnly, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Store business ID for stats update
    const businessId = review.business;

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update business statistics
    if (businessId) {
      await Business.updateBusinessStats(businessId);
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update review status (approve/flag)
router.patch('/reviews/:reviewId/status', adminOnly, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!['approved', 'flagged', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update business statistics if review is approved/flagged
    if (review.business && (status === 'approved' || status === 'flagged')) {
      await Business.updateBusinessStats(review.business);
    }

    res.json({ message: 'Review status updated successfully', review });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
