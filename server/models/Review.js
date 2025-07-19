import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(value) {
        return value % 0.5 === 0; // Allow half-star ratings (1, 1.5, 2, 2.5, etc.)
      },
      message: 'Rating must be in increments of 0.5 (1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)'
    }
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review comment must be at least 10 characters long'],
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters'],
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  moderatorNotes: {
    type: String,
    maxlength: [500, 'Moderator notes cannot exceed 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Compound index to ensure one review per user per business
reviewSchema.index({ user: 1, business: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ business: 1, rating: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ isHidden: 1, createdAt: -1 });

// Pre-save middleware to prevent duplicate reviews
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const existingReview = await this.constructor.findOne({
        user: this.user,
        business: this.business
      });
      
      if (existingReview) {
        const error = new Error('You have already reviewed this business. You can update your existing review instead.');
        error.code = 'DUPLICATE_REVIEW';
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get average rating for a business
reviewSchema.statics.getBusinessStats = async function(businessId) {
  try {
    const stats = await this.aggregate([
      {
        $match: { 
          business: new mongoose.Types.ObjectId(businessId),
          isHidden: false
        }
      },
      {
        $group: {
          _id: '$business',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $addFields: {
          averageRating: { $round: ['$averageRating', 1] }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {}
      };
    }

    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = result.ratingDistribution.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    return {
      averageRating: result.averageRating,
      totalReviews: result.totalReviews,
      ratingDistribution: distribution
    };
  } catch (error) {
    throw new Error(`Error calculating business stats: ${error.message}`);
  }
};

// Static method to check if user can review business
reviewSchema.statics.canUserReview = async function(userId, businessId) {
  try {
    const existingReview = await this.findOne({
      user: userId,
      business: businessId
    });
    
    return !existingReview;
  } catch (error) {
    throw new Error(`Error checking review permission: ${error.message}`);
  }
};

// Instance method to mark review as helpful
reviewSchema.methods.markHelpful = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Instance method to report review
reviewSchema.methods.reportReview = function(userId, reason) {
  // Check if user already reported this review
  const existingReport = this.reportedBy.find(
    report => report.user.toString() === userId.toString()
  );
  
  if (existingReport) {
    throw new Error('You have already reported this review');
  }
  
  this.reportedBy.push({
    user: userId,
    reason: reason
  });
  
  return this.save();
};

// Virtual for user's full name (populated)
reviewSchema.virtual('userFullName').get(function() {
  if (this.user && this.user.firstName && this.user.lastName) {
    return `${this.user.firstName} ${this.user.lastName}`;
  }
  return 'Anonymous User';
});

// Virtual for business name (populated)
reviewSchema.virtual('businessName').get(function() {
  if (this.user && this.business.name) {
    return this.business.name;
  }
  return 'Unknown Business';
});

// Transform output to include virtuals and hide sensitive data
reviewSchema.methods.toJSON = function() {
  const review = this.toObject({ virtuals: true });
  
  // Remove sensitive moderator information for non-admin users
  if (review.moderatorNotes) {
    delete review.moderatorNotes;
  }
  
  // Simplify reported information
  if (review.reportedBy && review.reportedBy.length > 0) {
    review.reportCount = review.reportedBy.length;
    delete review.reportedBy;
  } else {
    review.reportCount = 0;
  }
  
  return review;
};

export default mongoose.model('Review', reviewSchema);
