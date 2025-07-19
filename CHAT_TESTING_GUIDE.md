# Chat System Testing Guide

## Overview
This guide provides instructions for testing the real-time chat functionality between customers and vendors in the MyLocal_Connect application.

## Prerequisites
1. MongoDB running on localhost:27017
2. Node.js and pnpm installed
3. Environment variables configured (PORT, MONGODB_URI, JWT_SECRET)

## Starting the Application

### 1. Start the Server
```bash
cd server
pnpm install
pnpm run dev
```
Server will start on http://localhost:5000 with Socket.IO enabled.

### 2. Start the Client
```bash
cd client
pnpm install
pnpm run dev
```
Client will start on http://localhost:5173

## Testing the Chat System

### 1. User Registration & Authentication
- Register at least 2 users: one customer and one vendor
- Set one user's role to 'vendor' and add business information
- Log in with both users in different browser windows/incognito

### 2. Starting a Chat
1. Log in as a customer
2. Navigate to `/chat` or click "Messages" in the navigation
3. Click "Start New Chat" button
4. Search for a vendor by name or business name
5. Select the vendor and click "Start Chat"

### 3. Real-time Messaging
- Send messages from both customer and vendor sides
- Observe real-time delivery without page refresh
- Test typing indicators (start typing and see indicator appear)
- Check message timestamps and read receipts

### 4. Chat Features to Test
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message history persistence
- ✅ Unread message counts
- ✅ Chat search functionality
- ✅ User search in start chat modal
- ✅ Responsive design (mobile/desktop)

### 5. Backend API Testing
Use tools like Postman or curl to test REST endpoints:

```bash
# Get user's chats
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/chats

# Start a new chat
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"vendorId": "VENDOR_USER_ID"}' \
  http://localhost:5000/api/chats/start

# Send a message
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "Hello!", "messageType": "text"}' \
  http://localhost:5000/api/chats/CHAT_ID/messages
```

## Socket.IO Events Testing
Monitor browser console for Socket.IO events:
- `connect` - User connected to socket
- `message_received` - New message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `user_joined` - User joined chat room
- `user_left` - User left chat room

## Sample Data
The seed script includes sample chats and messages for testing:
```bash
cd server
node config/seed.js
```

## Troubleshooting

### Common Issues
1. **Socket connection fails**: Check server is running and CORS is configured
2. **Messages not delivering**: Verify JWT token is valid and user is authenticated
3. **Typing indicators not working**: Check socket event listeners are properly set up
4. **Chat not loading**: Verify database connection and chat data exists

### Debug Logs
Enable debug mode to see detailed Socket.IO logs:
```bash
DEBUG=socket.io* node server.js
```

## Architecture Overview

### Backend Components
- `server/models/Chat.js` - Chat document schema with participants
- `server/models/Message.js` - Message schema with content and metadata
- `server/services/socketService.js` - Socket.IO event handling
- `server/routes/chats.js` - REST API for chat operations

### Frontend Components
- `client/src/context/ChatContext.jsx` - React context for chat state
- `client/src/components/Chat/Chat.jsx` - Main chat container
- `client/src/components/Chat/ChatList.jsx` - Chat list sidebar
- `client/src/components/Chat/ChatWindow.jsx` - Message display and input
- `client/src/components/Chat/StartChatModal.jsx` - User search and chat creation

### Key Features Implemented
✅ Real-time messaging with Socket.IO
✅ JWT authentication for socket connections
✅ Persistent chat history with MongoDB
✅ Typing indicators and user presence
✅ Message read receipts and delivery status
✅ Responsive chat UI with modern design
✅ User search and chat initiation
✅ Integration with existing authentication system

## Next Steps for Enhancement
- File upload support for images/documents
- Push notifications for new messages
- Message reactions (emoji)
- Voice/video calling integration
- Message encryption
- Bulk message operations (delete, archive)
- Chat export functionality
- Advanced moderation tools
