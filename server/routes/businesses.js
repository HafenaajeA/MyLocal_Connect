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
// @desc    Get all businesses with comprehensive filtering, pagination, and sorting
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('subcategory').optional().isString().withMessage('Subcategory must be a string'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('state').optional().isString().withMessage('State must be a string'),
  query('zipCode').optional().isString().withMessage('ZIP code must be a string'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('priceRange').optional().isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
  query('search').optional().isString().withMessage('Search query must be a string'),
  query('tags').optional().isString().withMessage('Tags must be a comma-separated string'),
  query('lat').optional().isFloat().withMessage('Latitude must be a number'),
  query('lng').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
  query('sortBy').optional().isIn(['name', 'rating', 'views', 'createdAt', 'distance', 'relevance']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  query('hasImages').optional().isBoolean().withMessage('hasImages must be a boolean'),
  query('openNow').optional().isBoolean().withMessage('openNow must be a boolean')
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
      subcategory,
      city,
      state,
      zipCode,
      rating,
      priceRange,
      search,
      tags,
      lat,
      lng,
      radius = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
      isFeatured,
      isVerified,
      hasImages,
      openNow
    } = req.query;

    // Build comprehensive filter object
    const filter = { 
      isActive: isActive === 'false' ? false : true // Default to true unless explicitly set to false
    };

    // Category and subcategory filters
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = new RegExp(subcategory, 'i');

    // Location filters
    if (city) filter['location.address.city'] = new RegExp(city, 'i');
    if (state) filter['location.address.state'] = new RegExp(state, 'i');
    if (zipCode) filter['location.address.zipCode'] = zipCode;

    // Quality filters
    if (rating) filter['rating.average'] = { $gte: parseFloat(rating) };
    if (priceRange) filter.priceRange = priceRange;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    // Content filters
    if (hasImages === 'true') {
      filter.$or = [
        { imageUrl: { $exists: true, $ne: '' } },
        { 'images.0': { $exists: true } }
      ];
    }

    // Tag filter
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagList };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Open now filter (simplified implementation)
    if (openNow === 'true') {
      const now = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = dayNames[now.getDay()];
      
      filter[`businessHours.${today}.closed`] = false;
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

    // Build dynamic sort object
    const sortOptions = {};
    
    // Handle text search scoring
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    }
    
    // Handle different sort types
    switch (sortBy) {
      case 'name':
        sortOptions.name = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sortOptions['rating.average'] = sortOrder === 'desc' ? -1 : 1;
        sortOptions['rating.totalReviews'] = -1; // Secondary sort by review count
        break;
      case 'views':
        sortOptions.views = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'distance':
        // Distance sorting is handled by MongoDB's $near operator
        break;
      case 'relevance':
        if (search) {
          // Text search score already added above
        } else {
          // Default relevance: featured first, then rating, then views
          sortOptions.isFeatured = -1;
          sortOptions['rating.average'] = -1;
          sortOptions.views = -1;
        }
        break;
      default: // createdAt
        sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population and lean for better performance
    const businesses = await Business.find(filter)
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor avatar')
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

      // Sort by distance if that's the selected sort method
      if (sortBy === 'distance') {
        businesses.sort((a, b) => {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return sortOrder === 'desc' ? distB - distA : distA - distB;
        });
      }
    }

    // Prepare response with comprehensive metadata
    res.json({
      success: true,
      businesses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBusinesses: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      },
      filters: {
        category,
        subcategory,
        city,
        state,
        zipCode,
        rating: rating ? parseFloat(rating) : null,
        priceRange,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        isVerified: isVerified === 'true',
        hasImages: hasImages === 'true',
        openNow: openNow === 'true'
      },
      sorting: {
        sortBy,
        sortOrder,
        isLocationBased: !!(lat && lng)
      },
      searchQuery: search || null,
      location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) } : null
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

// @route   GET /api/businesses/categories
// @desc    Get all available business categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categoryCounts = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categories = categoryCounts.map(item => ({
      category: item._id,
      count: item.count
    }));

    res.json({
      success: true,
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/businesses/locations
// @desc    Get all available business locations (cities/states) with counts
// @access  Public
router.get('/locations', async (req, res) => {
  try {
    const { type = 'city' } = req.query; // 'city' or 'state'
    
    const locationField = type === 'state' ? 'location.address.state' : 'location.address.city';
    
    const locationCounts = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: `$${locationField}`, count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: '' } } },
      { $sort: { count: -1 } }
    ]);

    const locations = locationCounts.map(item => ({
      [type]: item._id,
      count: item.count
    }));

    res.json({
      success: true,
      locations,
      total: locations.length
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching locations'
    });
  }
});

// @route   GET /api/businesses/featured
// @desc    Get featured businesses with enhanced filtering
// @access  Public
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('location').optional().isString().withMessage('Location must be a string')
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

    const { limit = 6, category, location } = req.query;

    // Build filter for featured businesses
    const filter = { 
      isActive: true, 
      isFeatured: true,
      isVerified: true 
    };

    if (category) filter.category = category;
    if (location) {
      filter.$or = [
        { 'location.address.city': new RegExp(location, 'i') },
        { 'location.address.state': new RegExp(location, 'i') }
      ];
    }

    const businesses = await Business.find(filter)
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor')
      .sort({ 'rating.average': -1, views: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      businesses,
      total: businesses.length
    });
  } catch (error) {
    console.error('Get featured businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured businesses'
    });
  }
});

// @route   GET /api/businesses/nearby
// @desc    Get businesses near a specific location with enhanced location search
// @access  Public
router.get('/nearby', [
  query('lat').isFloat().withMessage('Latitude is required and must be a number'),
  query('lng').isFloat().withMessage('Longitude is required and must be a number'),
  query('radius').optional().isFloat({ min: 0, max: 50 }).withMessage('Radius must be between 0 and 50 miles'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5')
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
      lat, 
      lng, 
      radius = 10, 
      limit = 20, 
      category, 
      minRating = 0,
      sortBy = 'distance'
    } = req.query;

    // Build filter object
    const filter = { 
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1609.34 // Convert miles to meters
        }
      }
    };

    if (category) filter.category = category;
    if (minRating > 0) filter['rating.average'] = { $gte: parseFloat(minRating) };

    // Execute query
    const businesses = await Business.find(filter)
      .populate('vendor', 'username firstName lastName businessName isVerifiedVendor')
      .limit(parseInt(limit))
      .lean();

    // Add distance calculation and sort
    const businessesWithDistance = businesses.map(business => {
      if (business.location.coordinates.coordinates && business.location.coordinates.coordinates.length === 2) {
        const [businessLng, businessLat] = business.location.coordinates.coordinates;
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          businessLat,
          businessLng
        );
        return { ...business, distance: Math.round(distance * 100) / 100 };
      }
      return business;
    });

    // Sort by specified criteria
    if (sortBy === 'distance') {
      businessesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (sortBy === 'rating') {
      businessesWithDistance.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
    } else if (sortBy === 'views') {
      businessesWithDistance.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    res.json({
      success: true,
      businesses: businessesWithDistance,
      total: businessesWithDistance.length,
      searchCenter: { lat: parseFloat(lat), lng: parseFloat(lng) },
      searchRadius: parseFloat(radius)
    });
  } catch (error) {
    console.error('Get nearby businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby businesses'
    });
  }
});

// @route   GET /api/businesses/search/advanced
// @desc    Advanced search with multiple filters and faceted results
// @access  Public
router.get('/search/advanced', [
  query('q').optional().isString().withMessage('Search query must be a string'),
  query('categories').optional().isString().withMessage('Categories must be a comma-separated string'),
  query('priceRanges').optional().isString().withMessage('Price ranges must be a comma-separated string'),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5'),
  query('hasImages').optional().isBoolean().withMessage('hasImages must be a boolean'),
  query('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  query('openNow').optional().isBoolean().withMessage('openNow must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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
      q,
      categories,
      priceRanges,
      minRating = 0,
      hasImages,
      isVerified,
      openNow,
      page = 1,
      limit = 12,
      sortBy = 'relevance'
    } = req.query;

    // Build advanced filter object
    const filter = { isActive: true };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Category filter (multiple categories)
    if (categories) {
      const categoryList = categories.split(',').map(cat => cat.trim());
      filter.category = { $in: categoryList };
    }

    // Price range filter (multiple ranges)
    if (priceRanges) {
      const priceList = priceRanges.split(',').map(price => price.trim());
      filter.priceRange = { $in: priceList };
    }

    // Rating filter
    if (minRating > 0) {
      filter['rating.average'] = { $gte: parseFloat(minRating) };
    }

    // Image filter
    if (hasImages === 'true') {
      filter.$or = [
        { imageUrl: { $exists: true, $ne: '' } },
        { 'images.0': { $exists: true } }
      ];
    }

    // Verification filter
    if (isVerified === 'true') {
      filter.isVerified = true;
    }

    // Open now filter (simplified - would need time zone handling in production)
    if (openNow === 'true') {
      const now = new Date();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = dayNames[now.getDay()];
      const currentTime = now.toTimeString().slice(0, 5);
      
      filter[`businessHours.${today}.closed`] = false;
      // Note: This is a simplified check. In production, you'd want more sophisticated time comparison
    }

    // Build sort object
    const sortOptions = {};
    if (q) {
      sortOptions.score = { $meta: 'textScore' };
    }
    
    switch (sortBy) {
      case 'rating':
        sortOptions['rating.average'] = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      case 'views':
        sortOptions.views = -1;
        break;
      case 'alphabetical':
        sortOptions.name = 1;
        break;
      default: // relevance
        if (!q) sortOptions['rating.average'] = -1;
        break;
    }

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

    // Get faceted results for filters
    const facets = await Business.aggregate([
      { $match: { isActive: true } },
      {
        $facet: {
          categories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            { $group: { _id: '$priceRange', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          ratings: [
            { $match: { 'rating.average': { $gte: 1 } } },
            { $bucket: { 
                groupBy: '$rating.average', 
                boundaries: [1, 2, 3, 4, 5], 
                default: 'other',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      businesses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBusinesses: total,
        hasNextPage: skip + parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      },
      facets: facets[0],
      searchQuery: q || '',
      appliedFilters: {
        categories: categories ? categories.split(',') : [],
        priceRanges: priceRanges ? priceRanges.split(',') : [],
        minRating: parseFloat(minRating),
        hasImages: hasImages === 'true',
        isVerified: isVerified === 'true',
        openNow: openNow === 'true'
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during advanced search'
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
