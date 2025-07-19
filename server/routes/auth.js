import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user (customer or vendor)
// @access  Public
router.post('/register', [
  body('username').isLength({ min: 3 }).trim().withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('role').optional().isIn(['customer', 'vendor']).withMessage('Role must be either customer or vendor'),
  // Vendor-specific validations
  body('businessName').if(body('role').equals('vendor')).notEmpty().withMessage('Business name is required for vendors'),
  body('businessDescription').if(body('role').equals('vendor')).notEmpty().withMessage('Business description is required for vendors'),
  body('businessCategories').if(body('role').equals('vendor')).isArray({ min: 1 }).withMessage('At least one business category is required for vendors')
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
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'customer',
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessCategories,
      businessHours
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user object
    const userData = {
      username,
      email,
      password,
      firstName,
      lastName,
      role
    };

    // Add vendor-specific data if role is vendor
    if (role === 'vendor') {
      userData.businessName = businessName;
      userData.businessDescription = businessDescription;
      userData.businessAddress = businessAddress || {};
      userData.businessPhone = businessPhone || '';
      userData.businessWebsite = businessWebsite || '';
      userData.businessCategories = businessCategories || [];
      userData.businessHours = businessHours || {};
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role === 'vendor' ? 'Vendor' : 'Customer'} registered successfully`,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        ...(role === 'vendor' && {
          businessName: user.businessName,
          businessDescription: user.businessDescription,
          businessCategories: user.businessCategories,
          isVerifiedVendor: user.isVerifiedVendor
        })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          ...(user.role === 'vendor' && {
            businessName: user.businessName,
            businessCategories: user.businessCategories,
            isVerifiedVendor: user.isVerifiedVendor,
            vendorRating: user.vendorRating
          })
        }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// @route   POST /api/auth/register/vendor
// @desc    Register a new vendor with additional validation
// @access  Public
router.post('/register/vendor', [
  body('username').isLength({ min: 3 }).trim().withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('businessName').notEmpty().trim().withMessage('Business name is required'),
  body('businessDescription').notEmpty().trim().withMessage('Business description is required'),
  body('businessCategories').isArray({ min: 1 }).withMessage('At least one business category is required'),
  body('businessPhone').optional().isMobilePhone().withMessage('Please enter a valid phone number'),
  body('businessWebsite').optional().isURL().withMessage('Please enter a valid website URL')
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
      username, 
      email, 
      password, 
      firstName, 
      lastName,
      businessName,
      businessDescription,
      businessAddress,
      businessPhone,
      businessWebsite,
      businessCategories,
      businessHours
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Check if business name already exists
    const existingBusiness = await User.findOne({ businessName, role: 'vendor' });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'A business with this name already exists'
      });
    }

    // Create new vendor
    const vendor = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: 'vendor',
      businessName,
      businessDescription,
      businessAddress: businessAddress || {},
      businessPhone: businessPhone || '',
      businessWebsite: businessWebsite || '',
      businessCategories: businessCategories || [],
      businessHours: businessHours || {}
    });

    await vendor.save();

    // Generate token
    const token = generateToken(vendor._id);

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Account pending verification.',
      token,
      user: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        role: vendor.role,
        businessName: vendor.businessName,
        businessDescription: vendor.businessDescription,
        businessCategories: vendor.businessCategories,
        isVerifiedVendor: vendor.isVerifiedVendor,
        vendorRating: vendor.vendorRating
      }
    });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during vendor registration'
    });
  }
});

// @route   GET /api/auth/role-check
// @desc    Check user role and permissions
// @access  Private
router.get('/role-check', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      role: user.role,
      permissions: {
        canCreatePosts: true,
        canManageBusiness: user.role === 'vendor',
        canAccessAdminPanel: user.role === 'admin',
        isVerifiedVendor: user.role === 'vendor' ? user.isVerifiedVendor : false
      }
    });
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
