import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'vendor'],
      required: true
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  chatType: {
    type: String,
    enum: ['customer_vendor', 'support'],
    default: 'customer_vendor'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    customer: {
      type: Number,
      default: 0
    },
    vendor: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    customerInfo: {
      name: String,
      avatar: String
    },
    vendorInfo: {
      businessName: String,
      avatar: String
    }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ business: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ status: 1, lastActivity: -1 });

// Static method to find or create chat between customer and vendor
chatSchema.statics.findOrCreateChat = async function(customerId, vendorId, businessId) {
  try {
    // Look for existing chat
    let chat = await this.findOne({
      'participants.user': { $all: [customerId, vendorId] },
      business: businessId,
      status: { $ne: 'archived' }
    }).populate('participants.user', 'firstName lastName avatar role businessName')
      .populate('business', 'name')
      .populate('lastMessage');

    if (!chat) {
      // Create new chat
      const customerUser = await mongoose.model('User').findById(customerId);
      const vendorUser = await mongoose.model('User').findById(vendorId);
      const business = await mongoose.model('Business').findById(businessId);

      chat = new this({
        participants: [
          {
            user: customerId,
            role: 'customer'
          },
          {
            user: vendorId,
            role: 'vendor'
          }
        ],
        business: businessId,
        metadata: {
          customerInfo: {
            name: `${customerUser.firstName} ${customerUser.lastName}`,
            avatar: customerUser.avatar
          },
          vendorInfo: {
            businessName: vendorUser.businessName || business.name,
            avatar: vendorUser.avatar
          }
        }
      });

      await chat.save();
      
      // Populate the newly created chat
      chat = await this.findById(chat._id)
        .populate('participants.user', 'firstName lastName avatar role businessName')
        .populate('business', 'name')
        .populate('lastMessage');
    }

    return chat;
  } catch (error) {
    throw new Error(`Error finding or creating chat: ${error.message}`);
  }
};

// Static method to get user's chats
chatSchema.statics.getUserChats = async function(userId, options = {}) {
  try {
    const { page = 1, limit = 20, status = 'active' } = options;
    
    const filter = {
      'participants.user': userId,
      status: status
    };

    const chats = await this.find(filter)
      .populate('participants.user', 'firstName lastName avatar role businessName')
      .populate('business', 'name images')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalChats = await this.countDocuments(filter);
    const totalPages = Math.ceil(totalChats / parseInt(limit));

    return {
      chats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalChats,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    };
  } catch (error) {
    throw new Error(`Error getting user chats: ${error.message}`);
  }
};

// Instance method to mark messages as read
chatSchema.methods.markAsRead = async function(userId) {
  try {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant) {
      participant.lastRead = new Date();
      
      // Reset unread count for this user's role
      if (participant.role === 'customer') {
        this.unreadCount.customer = 0;
      } else if (participant.role === 'vendor') {
        this.unreadCount.vendor = 0;
      }
      
      await this.save();
    }
    return this;
  } catch (error) {
    throw new Error(`Error marking chat as read: ${error.message}`);
  }
};

// Instance method to increment unread count
chatSchema.methods.incrementUnreadCount = async function(senderRole) {
  try {
    if (senderRole === 'customer') {
      this.unreadCount.vendor += 1;
    } else if (senderRole === 'vendor') {
      this.unreadCount.customer += 1;
    }
    
    this.lastActivity = new Date();
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error incrementing unread count: ${error.message}`);
  }
};

// Instance method to update last message
chatSchema.methods.updateLastMessage = async function(messageId) {
  try {
    this.lastMessage = messageId;
    this.lastActivity = new Date();
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error updating last message: ${error.message}`);
  }
};

export default mongoose.model('Chat', chatSchema);
