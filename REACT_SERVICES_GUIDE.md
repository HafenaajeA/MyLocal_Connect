# React Frontend Services Guide

This guide explains how to connect your React frontend to the Express backend using Axios. The services are organized by functionality and provide a clean API layer for your components.

## Table of Contents

1. [API Configuration](#api-configuration)
2. [Authentication Service](#authentication-service)
3. [Business Service](#business-service)
4. [Chat Service](#chat-service)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## API Configuration

The base API configuration is in `/client/src/services/api.js`:

```javascript
import axios from 'axios';
import toast from 'react-hot-toast';

// API base configuration
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expired. Please login again.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Environment Variables

Create `/client/.env` file:

```env
VITE_SERVER_URL=http://localhost:5000
```

## Authentication Service

Located in `/client/src/services/authService.js`:

### Available Methods

#### Register
```javascript
import { authService } from '../services/authService';

const handleRegister = async (userData) => {
  try {
    const response = await authService.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer' // or 'vendor'
    });
    
    // User is automatically logged in after registration
    console.log('Registered user:', response.user);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

#### Login
```javascript
const handleLogin = async (credentials) => {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('Logged in user:', response.user);
    console.log('Token:', response.token);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

#### Logout
```javascript
const handleLogout = async () => {
  try {
    await authService.logout();
    // User is automatically redirected
  } catch (error) {
    console.error('Logout error:', error.message);
  }
};
```

#### Get Current User
```javascript
const getCurrentUser = () => {
  const user = authService.getCurrentUser();
  console.log('Current user:', user);
  return user;
};
```

#### Check Authentication
```javascript
const isAuthenticated = authService.isAuthenticated();
console.log('Is logged in:', isAuthenticated);
```

## Business Service

Located in `/client/src/services/businessService.js`:

### Available Methods

#### Get All Businesses
```javascript
import businessService from '../services/businessService';

const loadBusinesses = async () => {
  try {
    const options = {
      page: 1,
      limit: 20,
      category: 'restaurant',
      location: 'Nairobi',
      search: 'pizza'
    };
    
    const response = await businessService.getAllBusinesses(options);
    console.log('Businesses:', response.businesses);
    console.log('Total:', response.totalCount);
  } catch (error) {
    console.error('Failed to load businesses:', error.message);
  }
};
```

#### Get Business by ID
```javascript
const loadBusiness = async (businessId) => {
  try {
    const business = await businessService.getBusinessById(businessId);
    console.log('Business details:', business);
  } catch (error) {
    console.error('Failed to load business:', error.message);
  }
};
```

#### Create Business
```javascript
const createNewBusiness = async (businessData) => {
  try {
    const newBusiness = await businessService.createBusiness({
      name: 'My Restaurant',
      description: 'Best food in town',
      category: 'restaurant',
      address: {
        street: '123 Main St',
        city: 'Nairobi',
        county: 'Nairobi',
        country: 'Kenya'
      },
      contact: {
        phone: '+254700123456',
        email: 'info@myrestaurant.com',
        website: 'https://myrestaurant.com'
      },
      hours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        // ... other days
      },
      images: ['image1.jpg', 'image2.jpg'],
      services: ['dine-in', 'takeaway', 'delivery']
    });
    
    console.log('Created business:', newBusiness);
  } catch (error) {
    console.error('Failed to create business:', error.message);
  }
};
```

#### Update Business
```javascript
const updateBusiness = async (businessId, updates) => {
  try {
    const updatedBusiness = await businessService.updateBusiness(businessId, {
      name: 'Updated Restaurant Name',
      description: 'Updated description'
    });
    
    console.log('Updated business:', updatedBusiness);
  } catch (error) {
    console.error('Failed to update business:', error.message);
  }
};
```

#### Delete Business
```javascript
const deleteBusiness = async (businessId) => {
  try {
    await businessService.deleteBusiness(businessId);
    console.log('Business deleted successfully');
  } catch (error) {
    console.error('Failed to delete business:', error.message);
  }
};
```

#### Add/Update Review
```javascript
const addReview = async (businessId, reviewData) => {
  try {
    const review = await businessService.addReview(businessId, {
      rating: 5,
      title: 'Great experience!',
      comment: 'Excellent service and food quality.'
    });
    
    console.log('Added review:', review);
  } catch (error) {
    console.error('Failed to add review:', error.message);
  }
};
```

#### Get Reviews
```javascript
const loadReviews = async (businessId) => {
  try {
    const options = {
      page: 1,
      limit: 10,
      sortBy: 'newest' // or 'oldest', 'rating'
    };
    
    const response = await businessService.getReviews(businessId, options);
    console.log('Reviews:', response.reviews);
  } catch (error) {
    console.error('Failed to load reviews:', error.message);
  }
};
```

## Chat Service

Located in `/client/src/services/chatService.js`:

### Available Methods

#### Get User's Chats
```javascript
import chatService from '../services/chatService';

const loadChats = async () => {
  try {
    const options = {
      page: 1,
      limit: 20,
      status: 'active' // 'active', 'archived', 'closed'
    };
    
    const response = await chatService.getChats(options);
    console.log('Chats:', response.chats);
  } catch (error) {
    console.error('Failed to load chats:', error.message);
  }
};
```

#### Start New Chat
```javascript
const startNewChat = async (vendorId, businessId) => {
  try {
    const chat = await chatService.startChat(vendorId, businessId);
    console.log('Started chat:', chat);
    return chat;
  } catch (error) {
    console.error('Failed to start chat:', error.message);
  }
};
```

#### Get Chat Messages
```javascript
const loadMessages = async (chatId) => {
  try {
    const options = {
      page: 1,
      limit: 50
    };
    
    const response = await chatService.getMessages(chatId, options);
    console.log('Messages:', response.messages);
  } catch (error) {
    console.error('Failed to load messages:', error.message);
  }
};
```

#### Send Message
```javascript
const sendNewMessage = async (chatId, content) => {
  try {
    const message = await chatService.sendMessage(chatId, content, 'text');
    console.log('Sent message:', message);
    return message;
  } catch (error) {
    console.error('Failed to send message:', error.message);
  }
};
```

#### Mark Chat as Read
```javascript
const markChatRead = async (chatId) => {
  try {
    await chatService.markAsRead(chatId);
    console.log('Chat marked as read');
  } catch (error) {
    console.error('Failed to mark as read:', error.message);
  }
};
```

#### Update Chat Status
```javascript
const updateStatus = async (chatId, status) => {
  try {
    const updatedChat = await chatService.updateChatStatus(chatId, status);
    console.log('Updated chat status:', updatedChat);
  } catch (error) {
    console.error('Failed to update chat status:', error.message);
  }
};
```

## Usage Examples

### In React Components

#### Using with useState and useEffect
```javascript
import React, { useState, useEffect } from 'react';
import businessService from '../services/businessService';
import toast from 'react-hot-toast';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const response = await businessService.getAllBusinesses();
        setBusinesses(response.businesses);
      } catch (error) {
        toast.error('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {businesses.map(business => (
        <div key={business._id}>
          <h3>{business.name}</h3>
          <p>{business.description}</p>
        </div>
      ))}
    </div>
  );
};
```

#### Using with Chat Context
```javascript
import React from 'react';
import { useChat } from '../context/ChatContext';

const ChatComponent = () => {
  const { 
    chats, 
    activeChat, 
    sendMessage, 
    fetchChats, 
    startChat 
  } = useChat();

  const handleSendMessage = async (content) => {
    if (activeChat) {
      sendMessage(activeChat._id, content);
    }
  };

  const handleStartChat = async (vendorId, businessId) => {
    const chat = await startChat(vendorId, businessId);
    // Chat is automatically added to context
  };

  return (
    <div>
      {/* Chat UI */}
    </div>
  );
};
```

#### Using with Auth Context
```javascript
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const { login, loading } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      await login(formData);
      // User is automatically logged in and redirected
    } catch (error) {
      // Error handling is done by the service
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

## Error Handling

### Global Error Handling
The API interceptors handle common errors globally:

- **401 Unauthorized**: Automatically logs out user and redirects to login
- **403 Forbidden**: Shows access denied message
- **500+ Server Errors**: Shows generic server error message
- **Network Errors**: Shows connection error message

### Service-Level Error Handling
Each service method catches errors and:

1. Shows user-friendly toast notifications
2. Throws descriptive error messages
3. Logs errors to console for debugging

### Component-Level Error Handling
```javascript
const handleAction = async () => {
  try {
    await someService.someMethod();
    // Success handling
  } catch (error) {
    // Additional error handling if needed
    console.error('Component error:', error.message);
  }
};
```

## Best Practices

### 1. Use Environment Variables
Always use `import.meta.env.VITE_SERVER_URL` for API endpoints.

### 2. Error Handling
Let services handle errors and show toast notifications. Only add component-level error handling for specific cases.

### 3. Loading States
Services don't handle loading states. Manage these in your components:

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await someService.someMethod();
  } finally {
    setLoading(false);
  }
};
```

### 4. Data Validation
Validate data before sending to services:

```javascript
const handleCreateBusiness = async (data) => {
  if (!data.name || !data.category) {
    toast.error('Name and category are required');
    return;
  }
  
  await businessService.createBusiness(data);
};
```

### 5. Token Management
The API automatically handles JWT tokens. No manual token management needed.

### 6. Real-time Updates
For real-time features, combine REST API calls with Socket.IO:

```javascript
// Initial data load
const chats = await chatService.getChats();

// Real-time updates via socket
const { sendMessage } = useChat(); // Uses socket
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/:id` - Get business by ID
- `POST /api/businesses` - Create business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business
- `POST /api/businesses/:id/reviews` - Add review
- `GET /api/businesses/:id/reviews` - Get reviews

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats/start` - Start new chat
- `GET /api/chats/:id` - Get chat details
- `GET /api/chats/:id/messages` - Get messages
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/:id/read` - Mark as read
- `PUT /api/chats/:id/status` - Update status

This guide provides a complete overview of connecting your React frontend to the Express backend using Axios. The services provide a clean, maintainable API layer with proper error handling and type safety.
