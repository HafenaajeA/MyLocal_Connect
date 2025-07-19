import express from 'express';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import socketService from '../services/socketService.js';

const router = express.Router();

// Get user's chats
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status = 'active' } = req.query;

    const result = await Chat.getUserChats(userId, { page, limit, status });

    res.json(result);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ 
      message: 'Error fetching chats', 
      error: error.message 
    });
  }
});

// Get or create chat between customer and vendor
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { vendorId, businessId } = req.body;
    const customerId = req.user.id;

    if (!vendorId || !businessId) {
      return res.status(400).json({ 
        message: 'Vendor ID and Business ID are required' 
      });
    }

    // Verify vendor exists and has access to business
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Verify business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Prevent customers from chatting with themselves
    if (customerId === vendorId) {
      return res.status(400).json({ 
        message: 'Cannot start chat with yourself' 
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(customerId, vendorId, businessId);

    res.status(201).json({
      message: 'Chat started successfully',
      chat
    });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ 
      message: 'Error starting chat', 
      error: error.message 
    });
  }
});

// Get specific chat details
router.get('/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId
    }).populate('participants.user', 'firstName lastName avatar role businessName')
      .populate('business', 'name images address')
      .populate('lastMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ 
      message: 'Error fetching chat', 
      error: error.message 
    });
  }
});

// Get chat messages
router.get('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 50, 
      before = null, 
      after = null 
    } = req.query;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    const result = await Message.getChatMessages(chatId, { 
      page, 
      limit, 
      before, 
      after 
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ 
      message: 'Error fetching messages', 
      error: error.message 
    });
  }
});

// Send a message (HTTP endpoint - mainly for REST API compatibility)
router.post('/:chatId/messages', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { content, messageType = 'text', replyTo, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId
    }).populate('participants.user', 'firstName lastName role');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Get sender role
    const senderParticipant = chat.participants.find(p => p.user._id.toString() === userId);
    const senderRole = senderParticipant.role;

    // Create new message
    const message = new Message({
      chat: chatId,
      sender: userId,
      senderRole: senderRole,
      content: content.trim(),
      messageType,
      replyTo: replyTo || undefined,
      attachments: attachments || []
    });

    await message.save();

    // Populate message for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar role businessName')
      .populate('replyTo', 'content sender createdAt');

    // Update chat's last message and activity
    await chat.updateLastMessage(message._id);
    await chat.incrementUnreadCount(senderRole);

    // Emit real-time update via Socket.IO
    socketService.sendToChat(chatId, 'new_message', {
      chatId,
      message: populatedMessage
    });

    // Update chat list for all participants
    chat.participants.forEach(participant => {
      socketService.sendToUser(participant.user._id, 'chat_updated', {
        chatId,
        lastMessage: populatedMessage,
        lastActivity: chat.lastActivity
      });
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Error sending message', 
      error: error.message 
    });
  }
});

// Mark messages as read
router.put('/:chatId/read', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    // Mark messages as read
    const readCount = await Message.markMessagesAsRead(chatId, userId);
    await chat.markAsRead(userId);

    // Emit real-time update
    socketService.sendToChat(chatId, 'messages_read', {
      chatId,
      readBy: userId,
      readCount
    });

    res.json({
      message: 'Messages marked as read',
      readCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ 
      message: 'Error marking messages as read', 
      error: error.message 
    });
  }
});

// Update chat status (close, archive, etc.)
router.put('/:chatId/status', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    if (!['active', 'closed', 'archived'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be active, closed, or archived' 
      });
    }

    // Verify user is participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.user': userId
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }

    chat.status = status;
    chat.lastActivity = new Date();
    await chat.save();

    // Emit real-time update
    socketService.sendToChat(chatId, 'chat_status_updated', {
      chatId,
      status,
      updatedBy: userId
    });

    res.json({
      message: 'Chat status updated successfully',
      chat
    });
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({ 
      message: 'Error updating chat status', 
      error: error.message 
    });
  }
});

// Delete/Edit message (HTTP endpoints)
router.put('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    }).populate('chat');

    if (!message) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    await message.editContent(content.trim());
    
    const populatedMessage = await Message.findById(messageId)
      .populate('sender', 'firstName lastName avatar role businessName');

    // Emit real-time update
    socketService.sendToChat(message.chat._id, 'message_edited', {
      chatId: message.chat._id,
      message: populatedMessage
    });

    res.json({
      message: 'Message updated successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ 
      message: 'Error updating message', 
      error: error.message 
    });
  }
});

router.delete('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId,
      isDeleted: false
    }).populate('chat');

    if (!message) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    await message.softDelete();

    // Emit real-time update
    socketService.sendToChat(message.chat._id, 'message_deleted', {
      chatId: message.chat._id,
      messageId: messageId
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      message: 'Error deleting message', 
      error: error.message 
    });
  }
});

// Get online users (for admin or debugging)
router.get('/system/online-users', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const onlineUsers = socketService.getOnlineUsers();
    res.json({
      count: onlineUsers.length,
      users: onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ 
      message: 'Error fetching online users', 
      error: error.message 
    });
  }
});

// Search chats
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters' 
      });
    }

    // Search in chat participants and business names
    const chats = await Chat.find({
      'participants.user': userId,
      $or: [
        { 'metadata.customerInfo.name': { $regex: query, $options: 'i' } },
        { 'metadata.vendorInfo.businessName': { $regex: query, $options: 'i' } }
      ]
    }).populate('participants.user', 'firstName lastName avatar role businessName')
      .populate('business', 'name images')
      .populate('lastMessage')
      .limit(parseInt(limit))
      .sort({ lastActivity: -1 });

    res.json({
      query,
      results: chats
    });
  } catch (error) {
    console.error('Error searching chats:', error);
    res.status(500).json({ 
      message: 'Error searching chats', 
      error: error.message 
    });
  }
});

export default router;
