import express from 'express';
import { body, validationResult } from 'express-validator';
import BusinessListing from '../models/BusinessListing.js';
import User from '../models/User.js';
import { authMiddleware, vendorMiddleware, customerMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/business-listings
// @desc    Get all business listings with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      businessCategory, 
      vendor, 
      search, 
      minPrice, 
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured = false
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (businessCategory && businessCategory !== 'all') {
      query.businessCategory = businessCategory;
    }
    
    if (vendor) {
      query.vendor = vendor;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.amount'].$lte = parseFloat(maxPrice);
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price':
        sortOptions['price.amount'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sortOptions.averageRating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'views':
        sortOptions.views = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'reviews':
        sortOptions.totalReviews = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    const listings = await BusinessListing.find(query)
      .populate('vendor', 'username firstName lastName businessName avatar isVerifiedVendor vendorRating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BusinessListing.countDocuments(query);

    res.json({
      success: true,
      listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get business listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/business-listings/:id
// @desc    Get single business listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await BusinessListing.findById(req.params.id)
      .populate('vendor', 'username firstName lastName businessName businessAddress businessPhone businessWebsite avatar isVerifiedVendor vendorRating totalReviews')
      .populate('reviews.customer', 'username firstName lastName avatar');

    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Business listing not found'
      });
    }

    // Increment views
    listing.views += 1;
    await listing.save();

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('Get business listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/business-listings
// @desc    Create a new business listing (Vendor only)
// @access  Private (Vendor)
router.post('/', authMiddleware, vendorMiddleware, [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('category').isIn(['product', 'service']).withMessage('Category must be either product or service'),
  body('businessCategory').isIn(['restaurant', 'retail', 'services', 'healthcare', 'automotive', 'beauty', 'fitness', 'education', 'technology', 'other']).withMessage('Invalid business category'),
  body('price.amount').optional().isNumeric().withMessage('Price must be a number'),
  body('price.type').optional().isIn(['fixed', 'starting_at', 'hourly', 'contact_for_pricing']).withMessage('Invalid price type')
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

    // Verify user is a verified vendor
    const vendor = await User.findById(req.user.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Only vendors can create business listings'
      });
    }

    if (!vendor.isVerifiedVendor) {
      return res.status(403).json({
        success: false,
        message: 'Only verified vendors can create business listings'
      });
    }

    const {
      title,
      description,
      category,
      businessCategory,
      price,
      images,
      availability,
      location,
      tags,
      specifications
    } = req.body;

    const listing = new BusinessListing({
      title,
      description,
      category,
      businessCategory,
      price: price || {},
      images: images || [],
      availability: availability || {},
      location,
      tags: tags || [],
      specifications: specifications || [],
      vendor: req.user.id
    });

    await listing.save();
    await listing.populate('vendor', 'username firstName lastName businessName avatar isVerifiedVendor');

    res.status(201).json({
      success: true,
      message: 'Business listing created successfully',
      listing
    });
  } catch (error) {
    console.error('Create business listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/business-listings/:id
// @desc    Update a business listing (Vendor only - own listings)
// @access  Private (Vendor)
router.put('/:id', authMiddleware, vendorMiddleware, [
  body('title').optional().notEmpty().trim().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().trim().withMessage('Description cannot be empty'),
  body('category').optional().isIn(['product', 'service']).withMessage('Category must be either product or service'),
  body('businessCategory').optional().isIn(['restaurant', 'retail', 'services', 'healthcare', 'automotive', 'beauty', 'fitness', 'education', 'technology', 'other']).withMessage('Invalid business category')
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

    const listing = await BusinessListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Business listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    const {
      title,
      description,
      category,
      businessCategory,
      price,
      images,
      availability,
      location,
      tags,
      specifications
    } = req.body;

    // Update fields if provided
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (category) listing.category = category;
    if (businessCategory) listing.businessCategory = businessCategory;
    if (price) listing.price = { ...listing.price, ...price };
    if (images) listing.images = images;
    if (availability) listing.availability = { ...listing.availability, ...availability };
    if (location !== undefined) listing.location = location;
    if (tags) listing.tags = tags;
    if (specifications) listing.specifications = specifications;

    await listing.save();
    await listing.populate('vendor', 'username firstName lastName businessName avatar isVerifiedVendor');

    res.json({
      success: true,
      message: 'Business listing updated successfully',
      listing
    });
  } catch (error) {
    console.error('Update business listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/business-listings/:id
// @desc    Delete a business listing (Vendor only - own listings)
// @access  Private (Vendor)
router.delete('/:id', authMiddleware, vendorMiddleware, async (req, res) => {
  try {
    const listing = await BusinessListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Business listing not found'
      });
    }

    // Check if user owns the listing
    if (listing.vendor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    // Soft delete
    listing.isActive = false;
    await listing.save();

    res.json({
      success: true,
      message: 'Business listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete business listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/business-listings/:id/favorite
// @desc    Add/Remove listing from favorites (Customer only)
// @access  Private (Customer)
router.post('/:id/favorite', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const listing = await BusinessListing.findById(req.params.id);

    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Business listing not found'
      });
    }

    const userId = req.user.id;
    const existingFavorite = listing.favorites.find(fav => fav.user.toString() === userId);

    if (existingFavorite) {
      // Remove from favorites
      await listing.removeFromFavorites(userId);
      res.json({
        success: true,
        message: 'Removed from favorites',
        isFavorited: false,
        favoriteCount: listing.favorites.length
      });
    } else {
      // Add to favorites
      await listing.addToFavorites(userId);
      res.json({
        success: true,
        message: 'Added to favorites',
        isFavorited: true,
        favoriteCount: listing.favorites.length
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/business-listings/:id/review
// @desc    Add a review to a business listing (Customer only)
// @access  Private (Customer)
router.post('/:id/review', authMiddleware, customerMiddleware, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 500 }).withMessage('Review cannot exceed 500 characters')
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

    const listing = await BusinessListing.findById(req.params.id);

    if (!listing || !listing.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Business listing not found'
      });
    }

    const { rating, review } = req.body;

    try {
      await listing.addReview(req.user.id, rating, review || '');
      await listing.populate('reviews.customer', 'username firstName lastName avatar');

      res.json({
        success: true,
        message: 'Review added successfully',
        averageRating: listing.averageRating,
        totalReviews: listing.totalReviews,
        reviews: listing.reviews
      });
    } catch (reviewError) {
      return res.status(400).json({
        success: false,
        message: reviewError.message
      });
    }
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/business-listings/vendor/:vendorId
// @desc    Get all listings by vendor
// @access  Public
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const listings = await BusinessListing.find({ 
      vendor: req.params.vendorId, 
      isActive: true 
    })
    .populate('vendor', 'username firstName lastName businessName avatar isVerifiedVendor')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await BusinessListing.countDocuments({ 
      vendor: req.params.vendorId, 
      isActive: true 
    });

    res.json({
      success: true,
      listings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get vendor listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
