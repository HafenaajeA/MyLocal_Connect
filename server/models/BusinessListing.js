import mongoose from 'mongoose';

const businessListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['product', 'service']
  },
  businessCategory: {
    type: String,
    required: [true, 'Business category is required'],
    enum: ['restaurant', 'retail', 'services', 'healthcare', 'automotive', 'beauty', 'fitness', 'education', 'technology', 'other']
  },
  price: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    type: {
      type: String,
      enum: ['fixed', 'starting_at', 'hourly', 'contact_for_pricing'],
      default: 'fixed'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  availability: {
    inStock: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      min: 0
    },
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    availableHours: {
      start: String,
      end: String
    }
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  reviews: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoData: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
businessListingSchema.index({ vendor: 1, isActive: 1 });
businessListingSchema.index({ category: 1, businessCategory: 1 });
businessListingSchema.index({ averageRating: -1, totalReviews: -1 });
businessListingSchema.index({ createdAt: -1 });
businessListingSchema.index({ tags: 1 });

// Virtual for favorite count
businessListingSchema.virtual('favoriteCount').get(function() {
  return this.favorites.length;
});

// Method to add a review
businessListingSchema.methods.addReview = function(customerId, rating, review) {
  // Check if customer already reviewed
  const existingReview = this.reviews.find(r => r.customer.toString() === customerId.toString());
  if (existingReview) {
    throw new Error('Customer has already reviewed this listing');
  }

  this.reviews.push({ customer: customerId, rating, review });
  this.calculateAverageRating();
  return this.save();
};

// Method to calculate average rating
businessListingSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = (sum / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
};

// Method to add to favorites
businessListingSchema.methods.addToFavorites = function(userId) {
  const existingFavorite = this.favorites.find(fav => fav.user.toString() === userId.toString());
  if (!existingFavorite) {
    this.favorites.push({ user: userId });
  }
  return this.save();
};

// Method to remove from favorites
businessListingSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(fav => fav.user.toString() !== userId.toString());
  return this.save();
};

// Pre-save middleware to calculate rating
businessListingSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }
  next();
});

export default mongoose.model('BusinessListing', businessListingSchema);
