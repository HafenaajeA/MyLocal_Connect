# Review API Documentation

## Overview
The Review API allows users to create, read, update, and delete reviews for businesses. Each user can only leave one review per business, and the system automatically prevents duplicate reviews.

## Base URL
```
http://localhost:5001/api/reviews
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Review Model

### Review Schema
```javascript
{
  user: ObjectId,           // Reference to User
  business: ObjectId,       // Reference to Business
  rating: Number,           // 1-5 (with 0.5 increments)
  comment: String,          // 10-1000 characters
  title: String,            // Optional, max 100 characters
  isVerified: Boolean,      // Default false
  helpfulVotes: Number,     // Default 0
  reportedBy: Array,        // Users who reported this review
  isHidden: Boolean,        // For moderation
  moderatorNotes: String,   // Admin only
  createdAt: Date,
  updatedAt: Date
}
```

## Endpoints

### 1. Get Reviews for Business
```http
GET /business/:businessId
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Number of reviews per page
- `sortBy` (default: createdAt) - Sort field (createdAt, rating, helpfulVotes)
- `sortOrder` (default: desc) - Sort order (asc, desc)
- `rating` - Filter by specific rating

**Response:**
```json
{
  "reviews": [
    {
      "_id": "review_id",
      "user": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "avatar_url"
      },
      "business": "business_id",
      "rating": 4.5,
      "title": "Great experience!",
      "comment": "Detailed review comment...",
      "helpfulVotes": 5,
      "reportCount": 0,
      "createdAt": "2025-07-19T02:09:37.560Z",
      "updatedAt": "2025-07-19T02:09:37.560Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalReviews": 25,
    "hasNext": true,
    "hasPrev": false
  },
  "businessStats": {
    "averageRating": 4.2,
    "totalReviews": 25,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 3,
      "4": 8,
      "5": 13
    }
  }
}
```

### 2. Get Reviews by User
```http
GET /user/:userId
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10) - Number of reviews per page

**Response:**
```json
{
  "reviews": [
    {
      "_id": "review_id",
      "business": {
        "_id": "business_id",
        "name": "Business Name",
        "address": { "city": "San Francisco" },
        "images": ["image_url"]
      },
      "rating": 4.5,
      "title": "Great experience!",
      "comment": "Detailed review comment...",
      "createdAt": "2025-07-19T02:09:37.560Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalReviews": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Get Specific Review
```http
GET /:reviewId
```

**Response:**
```json
{
  "_id": "review_id",
  "user": {
    "_id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "avatar_url"
  },
  "business": {
    "_id": "business_id",
    "name": "Business Name",
    "address": { "city": "San Francisco" },
    "images": ["image_url"]
  },
  "rating": 4.5,
  "title": "Great experience!",
  "comment": "Detailed review comment...",
  "helpfulVotes": 5,
  "createdAt": "2025-07-19T02:09:37.560Z"
}
```

### 4. Create Review
```http
POST /
```
**Authentication Required**

**Request Body:**
```json
{
  "business": "business_id",
  "rating": 4.5,
  "title": "Great experience!",
  "comment": "This place exceeded my expectations. The service was excellent and the food was amazing."
}
```

**Response:**
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "review_id",
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "business": {
      "_id": "business_id",
      "name": "Business Name"
    },
    "rating": 4.5,
    "title": "Great experience!",
    "comment": "This place exceeded my expectations...",
    "createdAt": "2025-07-19T02:09:37.560Z"
  }
}
```

**Error Responses:**
- `409 Conflict` - User has already reviewed this business
- `404 Not Found` - Business not found
- `400 Bad Request` - Invalid data

### 5. Update Review
```http
PUT /:reviewId
```
**Authentication Required** (Only review author)

**Request Body:**
```json
{
  "rating": 5,
  "title": "Updated title",
  "comment": "Updated review comment with new information."
}
```

**Response:**
```json
{
  "message": "Review updated successfully",
  "review": {
    // Updated review object
  }
}
```

### 6. Delete Review
```http
DELETE /:reviewId
```
**Authentication Required** (Review author or admin)

**Response:**
```json
{
  "message": "Review deleted successfully"
}
```

### 7. Mark Review as Helpful
```http
POST /:reviewId/helpful
```
**Authentication Required**

**Response:**
```json
{
  "message": "Review marked as helpful",
  "helpfulVotes": 6
}
```

### 8. Report Review
```http
POST /:reviewId/report
```
**Authentication Required**

**Request Body:**
```json
{
  "reason": "inappropriate"
}
```

**Valid Reasons:**
- `inappropriate` - Inappropriate content
- `spam` - Spam or promotional content
- `fake` - Fake or fraudulent review
- `offensive` - Offensive language
- `other` - Other reason

**Response:**
```json
{
  "message": "Review reported successfully"
}
```

### 9. Check Review Permission
```http
GET /check/:businessId
```
**Authentication Required**

**Response:**
```json
{
  "canReview": true,
  "message": "You can review this business"
}
```

### 10. Get Business Statistics
```http
GET /stats/:businessId
```

**Response:**
```json
{
  "averageRating": 4.2,
  "totalReviews": 25,
  "ratingDistribution": {
    "1": 0,
    "2": 1,
    "3": 3,
    "4": 8,
    "5": 13
  }
}
```

## Admin Endpoints

### Hide Review
```http
PUT /:reviewId/hide
```
**Authentication Required** (Admin only)

**Request Body:**
```json
{
  "moderatorNotes": "Hidden due to inappropriate content"
}
```

### Unhide Review
```http
PUT /:reviewId/unhide
```
**Authentication Required** (Admin only)

## Features

### Duplicate Prevention
- Uses compound unique index on `user` + `business`
- Pre-save middleware validates for duplicates
- Returns `409 Conflict` status for duplicate attempts

### Rating System
- Supports ratings from 1-5 with 0.5 increments
- Validates rating format on save
- Calculates business statistics automatically

### Moderation
- Users can report reviews for various reasons
- Admins can hide/unhide reviews
- Hidden reviews are excluded from public queries

### Performance
- Indexed for efficient queries
- Paginated responses
- Optimized aggregation for statistics

## Error Handling

### Common Error Codes
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (no token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate review)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Example Usage

### Complete Review Flow
```javascript
// 1. Check if user can review
const permission = await fetch('/api/reviews/check/business_id', {
  headers: { Authorization: `Bearer ${token}` }
});

// 2. Create review if allowed
const review = await fetch('/api/reviews', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}` 
  },
  body: JSON.stringify({
    business: 'business_id',
    rating: 4.5,
    title: 'Great experience!',
    comment: 'Detailed review comment...'
  })
});

// 3. Get business reviews
const reviews = await fetch('/api/reviews/business/business_id?page=1&limit=10');

// 4. Mark review as helpful
const helpful = await fetch(`/api/reviews/${reviewId}/helpful`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

## Testing
Use the provided test script to verify all endpoints:
```bash
node test-review-api.js
```
