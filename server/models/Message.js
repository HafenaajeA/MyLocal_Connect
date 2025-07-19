import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      enum: ['👍', '❤️', '😊', '😂', '😮', '😢', '😡']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    deliveredAt: Date,
    failedAt: Date,
    retryCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ isDeleted: 1, createdAt: -1 });

// Static method to get chat messages with pagination
messageSchema.statics.getChatMessages = async function(chatId, options = {}) {
  try {
    const { 
      page = 1, 
      limit = 50, 
      before = null, 
      after = null,
      includeDeleted = false 
    } = options;

    let filter = { 
      chat: chatId
    };

    if (!includeDeleted) {
      filter.isDeleted = false;
    }

    // Date range filtering
    if (before) {
      filter.createdAt = { ...filter.createdAt, $lt: new Date(before) };
    }
    if (after) {
      filter.createdAt = { ...filter.createdAt, $gt: new Date(after) };
    }

    const messages = await this.find(filter)
      .populate('sender', 'firstName lastName avatar role businessName')
      .populate('replyTo', 'content sender createdAt')
      .populate('readBy.user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalMessages = await this.countDocuments(filter);
    const totalPages = Math.ceil(totalMessages / parseInt(limit));

    // Reverse to show oldest first
    return {
      messages: messages.reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalMessages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    };
  } catch (error) {
    throw new Error(`Error getting chat messages: ${error.message}`);
  }
};

// Static method to mark messages as read
messageSchema.statics.markMessagesAsRead = async function(chatId, userId) {
  try {
    const messages = await this.find({
      chat: chatId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
      isDeleted: false
    });

    const bulkOps = messages.map(message => ({
      updateOne: {
        filter: { _id: message._id },
        update: {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await this.bulkWrite(bulkOps);
    }

    return messages.length;
  } catch (error) {
    throw new Error(`Error marking messages as read: ${error.message}`);
  }
};

// Instance method to mark as read by user
messageSchema.methods.markAsReadBy = async function(userId) {
  try {
    const alreadyRead = this.readBy.some(read => read.user.toString() === userId.toString());
    
    if (!alreadyRead) {
      this.readBy.push({
        user: userId,
        readAt: new Date()
      });
      await this.save();
    }
    
    return this;
  } catch (error) {
    throw new Error(`Error marking message as read: ${error.message}`);
  }
};

// Instance method to add reaction
messageSchema.methods.addReaction = async function(userId, emoji) {
  try {
    // Remove any existing reaction from this user
    this.reactions = this.reactions.filter(
      reaction => reaction.user.toString() !== userId.toString()
    );
    
    // Add new reaction
    this.reactions.push({
      user: userId,
      emoji: emoji,
      createdAt: new Date()
    });
    
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error adding reaction: ${error.message}`);
  }
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  try {
    this.reactions = this.reactions.filter(
      reaction => reaction.user.toString() !== userId.toString()
    );
    
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error removing reaction: ${error.message}`);
  }
};

// Instance method to edit message
messageSchema.methods.editContent = async function(newContent) {
  try {
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error editing message: ${error.message}`);
  }
};

// Instance method to soft delete message
messageSchema.methods.softDelete = async function() {
  try {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = 'This message has been deleted';
    await this.save();
    return this;
  } catch (error) {
    throw new Error(`Error deleting message: ${error.message}`);
  }
};

// Virtual for checking if message is read by all participants
messageSchema.virtual('isReadByAll').get(function() {
  // This would need chat participant info to be accurate
  return this.readBy.length >= 2; // Assuming 2 participants for now
});

// Transform output
messageSchema.methods.toJSON = function() {
  const message = this.toObject({ virtuals: true });
  
  // Don't show content if deleted (unless needed for admin)
  if (message.isDeleted && message.content !== 'This message has been deleted') {
    message.content = 'This message has been deleted';
  }
  
  return message;
};

export default mongoose.model('Message', messageSchema);
