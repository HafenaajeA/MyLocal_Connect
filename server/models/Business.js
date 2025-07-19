import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters'],
    minlength: [2, 'Business name must be at least 2 characters long']
  },
  category: {
    type: String,
    required: [true, 'Business category is required'],
    enum: [
      'restaurant',
      'retail',
      'services',
      'healthcare',
      'automotive',
      'beauty',
      'fitness',
      'education',
      'technology',
      'entertainment',
      'real-estate',
      'finance',
      'legal',
      'travel',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Business description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  location: {
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
        maxlength: [200, 'Street address cannot exceed 200 characters']
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [50, 'State cannot exceed 50 characters']
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true,
        match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
      },
      country: {
        type: String,
        default: 'United States',
        trim: true,
        maxlength: [50, 'Country cannot exceed 50 characters']
      }
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },
  imageUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid image URL']
  },
  images: [{
    url: {
      type: String,
      required: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid image URL']
    },
    caption: {
      type: String,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  businessHours: {
    monday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      closed: { type: Boolean, default: false }
    }
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor reference is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  amenities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Amenity cannot exceed 50 characters']
  }],
  services: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Service description cannot exceed 500 characters']
    },
    price: {
      type: Number,
      min: 0
    },
    duration: {
      type: String,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
businessSchema.index({ vendor: 1 });
businessSchema.index({ category: 1 });
businessSchema.index({ 'location.address.city': 1 });
businessSchema.index({ 'location.address.state': 1 });
businessSchema.index({ 'location.coordinates': '2dsphere' });
businessSchema.index({ name: 'text', description: 'text', tags: 'text' });
businessSchema.index({ isActive: 1, isVerified: 1 });
businessSchema.index({ 'rating.average': -1 });
businessSchema.index({ createdAt: -1 });

// Virtual for full address
businessSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Virtual for primary image
businessSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
  }
  return this.imageUrl || null;
});

// Method to check if business is open
businessSchema.methods.isOpenNow = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = dayNames[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.businessHours[today];
  if (!todayHours || todayHours.closed) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Method to calculate distance between two coordinates
businessSchema.methods.calculateDistance = function(lat, lng) {
  if (!this.location.coordinates.coordinates || this.location.coordinates.coordinates.length !== 2) {
    return null;
  }
  
  const [businessLng, businessLat] = this.location.coordinates.coordinates;
  const R = 3959; // Earth's radius in miles
  const dLat = (lat - businessLat) * Math.PI / 180;
  const dLng = (lng - businessLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(businessLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

// Update lastUpdated before saving
businessSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Transform output to include virtuals
businessSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Business', businessSchema);
