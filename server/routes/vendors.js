import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware, vendorMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/vendors
// @desc    Get all verified vendors with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, city, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query for verified vendors
    let query = { role: 'vendor', isVerifiedVendor: true };
    
    if (category && category !== 'all') {
      query.businessCategories = { $in: [category] };
    }
    
    if (city) {
      query['businessAddress.city'] = { $regex: city, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { businessDescription: { $regex: search, $options: 'i' } },
        { businessCategories: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const vendors = await User.find(query)
      .select('username firstName lastName businessName businessDescription businessCategories businessAddress businessPhone businessWebsite businessHours vendorRating totalReviews avatar')
      .sort({ vendorRating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      vendors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vendors/:id
// @desc    Get vendor profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id, 
      role: 'vendor' 
    }).select('-password');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Get vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/vendors/profile
// @desc    Update vendor profile
// @access  Private (Vendor only)
router.put('/profile', authMiddleware, vendorMiddleware, [
  body('businessName').optional().notEmpty().trim().withMessage('Business name cannot be empty'),
  body('businessDescription').optional().notEmpty().trim().withMessage('Business description cannot be empty'),
  body('businessPhone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('businessWebsite').optional().isURL().withMessage('Please enter a valid website URL'),
  body('businessCategories').optional().isArray({ min: 1 }).withMessage('At least one business category is required')
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
      firstName,
      lastName,
      bio,
      location,
      avatar,
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessCategories,
      businessHours
    } = req.body;

    const vendor = await User.findById(req.user.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if business name already exists (exclude current vendor)
    if (businessName && businessName !== vendor.businessName) {
      const existingBusiness = await User.findOne({ 
        businessName, 
        role: 'vendor',
        _id: { $ne: vendor._id }
      });
      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: 'A business with this name already exists'
        });
      }
    }

    // Update general profile fields
    if (firstName) vendor.firstName = firstName;
    if (lastName) vendor.lastName = lastName;
    if (bio !== undefined) vendor.bio = bio;
    if (location !== undefined) vendor.location = location;
    if (avatar !== undefined) vendor.avatar = avatar;

    // Update business-specific fields
    if (businessName) vendor.businessName = businessName;
    if (businessDescription) vendor.businessDescription = businessDescription;
    if (businessAddress) vendor.businessAddress = { ...vendor.businessAddress, ...businessAddress };
    if (businessPhone !== undefined) vendor.businessPhone = businessPhone;
    if (businessWebsite !== undefined) vendor.businessWebsite = businessWebsite;
    if (businessCategories) vendor.businessCategories = businessCategories;
    if (businessHours) vendor.businessHours = { ...vendor.businessHours, ...businessHours };

    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        role: vendor.role,
        bio: vendor.bio,
        location: vendor.location,
        avatar: vendor.avatar,
        businessName: vendor.businessName,
        businessDescription: vendor.businessDescription,
        businessAddress: vendor.businessAddress,
        businessPhone: vendor.businessPhone,
        businessWebsite: vendor.businessWebsite,
        businessCategories: vendor.businessCategories,
        businessHours: vendor.businessHours,
        isVerifiedVendor: vendor.isVerifiedVendor,
        vendorRating: vendor.vendorRating,
        totalReviews: vendor.totalReviews
      }
    });
  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/vendors/:id/verify
// @desc    Verify a vendor (Admin only)
// @access  Private (Admin only)
router.post('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id, 
      role: 'vendor' 
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isVerifiedVendor = true;
    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor verified successfully',
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        isVerifiedVendor: vendor.isVerifiedVendor
      }
    });
  } catch (error) {
    console.error('Verify vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/vendors/:id/unverify
// @desc    Unverify a vendor (Admin only)
// @access  Private (Admin only)
router.post('/:id/unverify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vendor = await User.findOne({ 
      _id: req.params.id, 
      role: 'vendor' 
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    vendor.isVerifiedVendor = false;
    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor verification removed',
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        isVerifiedVendor: vendor.isVerifiedVendor
      }
    });
  } catch (error) {
    console.error('Unverify vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/vendors/categories/list
// @desc    Get list of all business categories
// @access  Public
router.get('/categories/list', (req, res) => {
  const categories = [
    'restaurant',
    'retail',
    'services',
    'healthcare',
    'automotive',
    'beauty',
    'fitness',
    'education',
    'technology',
    'other'
  ];

  res.json({
    success: true,
    categories
  });
});

// @route   GET /api/vendors/pending
// @desc    Get pending vendor verifications (Admin only)
// @access  Private (Admin only)
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const pendingVendors = await User.find({ 
      role: 'vendor', 
      isVerifiedVendor: false 
    })
    .select('username firstName lastName email businessName businessDescription businessCategories createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await User.countDocuments({ 
      role: 'vendor', 
      isVerifiedVendor: false 
    });

    res.json({
      success: true,
      vendors: pendingVendors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get pending vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
