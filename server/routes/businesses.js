import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Business from '../models/Business.js';
import User from '../models/User.js';
import { authMiddleware, vendorMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/businesses
// @desc    Create a new business
// @access  Private (Vendor only)
router.post('/', [
  authMiddleware,
  vendorMiddleware,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2-100 characters'),
  body('category').isIn([
    'restaurant', 'retail', 'services', 'healthcare', 'automotive', 'beauty', 
    'fitness', 'education', 'technology', 'entertainment', 'real-estate', 
    'finance', 'legal', 'travel', 'other'
  ]).withMessage('Invalid business category'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
  body('location.address.street').trim().notEmpty().withMessage('Street address is required'),
  body('location.address.city').trim().notEmpty().withMessage('City is required'),
  body('location.address.state').trim().notEmpty().withMessage('State is required'),
  body('location.address.zipCode').matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid ZIP code format'),
  body('contactInfo.phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  body('contactInfo.email').optional().isEmail().withMessage('Invalid email format'),
  body('contactInfo.website').optional().isURL().withMessage('Invalid website URL'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Check if vendor already has a business with the same name
    const existingBusiness = await Business.findOne({
      vendor: req.user.id,
      name: req.body.name
    });

    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'You already have a business with this name'
      });
    }

    // Create business object
    const businessData = {
      ...req.body,
      vendor: req.user.id
    };

    // Create new business
    const business = new Business(businessData);
    await business.save();

    // Populate vendor information
    await business.populate('vendor', 'username firstName lastName email businessName');

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      business
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating business'
    });
  }
});

// @route   GET /api/businesses
// @desc    Get all businesses with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('state').optional().isString().withMessage('State must be a string'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
  query('search').optional().isString().withMessage('Search query must be a string'),
  query('lat').optional().isFloat().withMessage('Latitude must be a number'),
  query('lng').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      category,
      city,
      state,
      rating,
      priceRange,
      search,
      lat,
      lng,
      radius = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
      isFeatured
    } = req.query;

    // Build filter object
    const filter = { isActive: isActive === 'true' };

    if (category) filter.category = category;
    if (city) filter['location.address.city'] = new RegExp(city, 'i');
    if (state) filter['location.address.state'] = new RegExp(state, 'i');
    if (rating) filter['rating.average'] = { $gte: parseFloat(rating) };
    if (priceRange) filter.priceRange = priceRange;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Geographic search
    if (lat && lng) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      };
    }

    // Build sort object
    const sortOptions = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const businesses = await Business.find(filter)
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Business.countDocuments(filter);

    // Add distance calculation if coordinates provided
    if (lat && lng) {
      businesses.forEach(business => {
        if (business.location.coordinates.coordinates && business.location.coordinates.coordinates.length === 2) {
          const [businessLng, businessLat] = business.location.coordinates.coordinates;
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            businessLat,
            businessLng
          );
          business.distance = Math.round(distance * 100) / 100; // Round to 2 decimal places
        }
      });
    }

    res.json({
      success: true,
      businesses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBusinesses: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching businesses'
    });
  }
});

// @route   GET /api/businesses/:id
// @desc    Get single business by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor avatar');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Increment view count
    business.views += 1;
    await business.save();

    res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Get business error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching business'
    });
  }
});

// @route   PUT /api/businesses/:id
// @desc    Update business
// @access  Private (Vendor - own business only, Admin - any business)
router.put('/:id', [
  authMiddleware,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be between 2-100 characters'),
  body('category').optional().isIn([
    'restaurant', 'retail', 'services', 'healthcare', 'automotive', 'beauty', 
    'fitness', 'education', 'technology', 'entertainment', 'real-estate', 
    'finance', 'legal', 'travel', 'other'
  ]).withMessage('Invalid business category'),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10-2000 characters'),
  body('contactInfo.phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  body('contactInfo.email').optional().isEmail().withMessage('Invalid email format'),
  body('contactInfo.website').optional().isURL().withMessage('Invalid website URL'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user owns the business or is admin
    if (business.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this business'
      });
    }

    // Update business
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
          // Handle nested objects (like location, contactInfo)
          business[key] = { ...business[key], ...req.body[key] };
        } else {
          business[key] = req.body[key];
        }
      }
    });

    await business.save();
    await business.populate('vendor', 'username firstName lastName businessName isVerifiedVendor');

    res.json({
      success: true,
      message: 'Business updated successfully',
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating business'
    });
  }
});

// @route   DELETE /api/businesses/:id
// @desc    Delete business
// @access  Private (Vendor - own business only, Admin - any business)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user owns the business or is admin
    if (business.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this business'
      });
    }

    await Business.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Delete business error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting business'
    });
  }
});

// @route   GET /api/businesses/vendor/:vendorId
// @desc    Get all businesses for a specific vendor
// @access  Public
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const businesses = await Business.find({ 
      vendor: req.params.vendorId, 
      isActive: true 
    })
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Business.countDocuments({ 
      vendor: req.params.vendorId, 
      isActive: true 
    });

    res.json({
      success: true,
      businesses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBusinesses: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get vendor businesses error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid vendor ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor businesses'
    });
  }
});

// @route   POST /api/businesses/:id/toggle-status
// @desc    Toggle business active status
// @access  Private (Vendor - own business only, Admin - any business)
router.post('/:id/toggle-status', authMiddleware, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if user owns the business or is admin
    if (business.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this business'
      });
    }

    business.isActive = !business.isActive;
    await business.save();

    res.json({
      success: true,
      message: `Business ${business.isActive ? 'activated' : 'deactivated'} successfully`,
      business: { id: business._id, isActive: business.isActive }
    });
  } catch (error) {
    console.error('Toggle business status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating business status'
    });
  }
});

// @route   POST /api/businesses/:id/verify
// @desc    Verify business (Admin only)
// @access  Private (Admin only)
router.post('/:id/verify', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    business.isVerified = !business.isVerified;
    await business.save();

    res.json({
      success: true,
      message: `Business ${business.isVerified ? 'verified' : 'unverified'} successfully`,
      business: { id: business._id, isVerified: business.isVerified }
    });
  } catch (error) {
    console.error('Verify business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying business'
    });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
