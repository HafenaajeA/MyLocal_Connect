import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> { socketId, userInfo }
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('No authentication token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('📡 Socket.IO service initialized');
    return this.io;
  }

  handleConnection(socket) {
    const userId = socket.userId;
    const user = socket.user;

    console.log(`🔌 User ${user.firstName} ${user.lastName} connected (${socket.id})`);

    // Store user connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userInfo: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        businessName: user.businessName
      },
      lastSeen: new Date()
    });
    
    this.userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join user to their chat rooms
    this.joinUserChats(socket, userId);

    // Emit user online status to relevant users
    this.broadcastUserStatus(userId, 'online');

    // Handle chat events
    this.setupChatHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  async joinUserChats(socket, userId) {
    try {
      const { chats } = await Chat.getUserChats(userId, { limit: 100 });
      
      chats.forEach(chat => {
        socket.join(`chat_${chat._id}`);
      });
      
      console.log(`📨 User ${userId} joined ${chats.length} chat rooms`);
    } catch (error) {
      console.error('Error joining user chats:', error);
    }
  }

  setupChatHandlers(socket) {
    const userId = socket.userId;

    // Join a specific chat room
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant in this chat
        const chat = await Chat.findOne({
          _id: chatId,
          'participants.user': userId
        });

        if (chat) {
          socket.join(`chat_${chatId}`);
          
          // Mark messages as read
          await Message.markMessagesAsRead(chatId, userId);
          await chat.markAsRead(userId);
          
          socket.emit('chat_joined', { chatId, success: true });
          
          // Notify other participants that user is in chat
          socket.to(`chat_${chatId}`).emit('user_joined_chat', {
            chatId,
            user: this.connectedUsers.get(userId)?.userInfo
          });
        } else {
          socket.emit('chat_error', { message: 'Chat not found or access denied' });
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('chat_error', { message: 'Failed to join chat' });
      }
    });

    // Leave a chat room
    socket.on('leave_chat', (data) => {
      const { chatId } = data;
      socket.leave(`chat_${chatId}`);
      
      // Notify other participants
      socket.to(`chat_${chatId}`).emit('user_left_chat', {
        chatId,
        user: this.connectedUsers.get(userId)?.userInfo
      });
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, messageType = 'text', replyTo, attachments } = data;
        
        // Verify user is participant in this chat
        const chat = await Chat.findOne({
          _id: chatId,
          'participants.user': userId
        }).populate('participants.user', 'firstName lastName role');

        if (!chat) {
          return socket.emit('message_error', { message: 'Chat not found or access denied' });
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

        // Emit to all participants in the chat
        this.io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: populatedMessage
        });

        // Send push notification to offline users (would implement with FCM/APNS)
        this.notifyOfflineUsers(chat, populatedMessage);

        // Emit chat list update to all participants
        chat.participants.forEach(participant => {
          this.io.to(`user_${participant.user._id}`).emit('chat_updated', {
            chatId,
            lastMessage: populatedMessage,
            lastActivity: chat.lastActivity
          });
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // Edit a message
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, newContent } = data;
        
        const message = await Message.findOne({
          _id: messageId,
          sender: userId,
          isDeleted: false
        }).populate('chat');

        if (!message) {
          return socket.emit('message_error', { message: 'Message not found or access denied' });
        }

        await message.editContent(newContent);
        
        const populatedMessage = await Message.findById(messageId)
          .populate('sender', 'firstName lastName avatar role businessName');

        // Emit to all participants in the chat
        this.io.to(`chat_${message.chat._id}`).emit('message_edited', {
          chatId: message.chat._id,
          message: populatedMessage
        });

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('message_error', { message: 'Failed to edit message' });
      }
    });

    // Delete a message
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findOne({
          _id: messageId,
          sender: userId,
          isDeleted: false
        }).populate('chat');

        if (!message) {
          return socket.emit('message_error', { message: 'Message not found or access denied' });
        }

        await message.softDelete();

        // Emit to all participants in the chat
        this.io.to(`chat_${message.chat._id}`).emit('message_deleted', {
          chatId: message.chat._id,
          messageId: messageId
        });

      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('message_error', { message: 'Failed to delete message' });
      }
    });

    // Add reaction to message
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        
        const message = await Message.findById(messageId).populate('chat');
        
        if (!message) {
          return socket.emit('message_error', { message: 'Message not found' });
        }

        // Verify user is participant in the chat
        const chat = await Chat.findOne({
          _id: message.chat._id,
          'participants.user': userId
        });

        if (!chat) {
          return socket.emit('message_error', { message: 'Access denied' });
        }

        await message.addReaction(userId, emoji);

        const populatedMessage = await Message.findById(messageId)
          .populate('reactions.user', 'firstName lastName');

        // Emit to all participants in the chat
        this.io.to(`chat_${message.chat._id}`).emit('reaction_added', {
          chatId: message.chat._id,
          messageId: messageId,
          reactions: populatedMessage.reactions
        });

      } catch (error) {
        console.error('Error adding reaction:', error);
        socket.emit('message_error', { message: 'Failed to add reaction' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        user: this.connectedUsers.get(userId)?.userInfo
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        chatId,
        user: this.connectedUsers.get(userId)?.userInfo
      });
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId } = data;
        
        await Message.markMessagesAsRead(chatId, userId);
        const chat = await Chat.findById(chatId);
        await chat.markAsRead(userId);

        // Notify other participants
        socket.to(`chat_${chatId}`).emit('messages_read', {
          chatId,
          readBy: userId
        });

      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  handleDisconnection(socket) {
    const userId = this.userSockets.get(socket.id);
    
    if (userId) {
      console.log(`🔌 User ${userId} disconnected (${socket.id})`);
      
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
      
      // Broadcast user offline status
      this.broadcastUserStatus(userId, 'offline');
    }
  }

  broadcastUserStatus(userId, status) {
    // This would broadcast to relevant users (chat participants)
    // For now, we'll implement a simple broadcast
    this.io.emit('user_status_changed', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  async notifyOfflineUsers(chat, message) {
    // Here you would implement push notifications
    // For now, we'll just log that we would send notifications
    const offlineParticipants = chat.participants.filter(p => 
      p.user._id.toString() !== message.sender.toString() && 
      !this.connectedUsers.has(p.user._id.toString())
    );
    
    if (offlineParticipants.length > 0) {
      console.log(`📱 Would send push notification to ${offlineParticipants.length} offline users`);
    }
  }

  // Public methods for external use
  sendToUser(userId, event, data) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  sendToChat(chatId, event, data) {
    this.io.to(`chat_${chatId}`).emit(event, data);
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.values()).map(conn => conn.userInfo);
  }
}

// Export singleton instance
export default new SocketService();
