# Business API Documentation

## Business Model

The Business model represents local businesses on the platform with comprehensive information including location, contact details, services, and vendor relationship.

### Business Schema Fields

- **name**: Business name (required, 2-100 characters)
- **category**: Business category (required, predefined enum values)
- **subcategory**: Optional subcategory for more specific classification
- **description**: Business description (required, 10-2000 characters)
- **location**: Address and coordinates
  - **address**: Street, city, state, zipCode, country
  - **coordinates**: Latitude and longitude for mapping
- **contactInfo**: Phone, email, website, social media links
- **imageUrl**: Primary business image URL
- **images**: Array of additional images with captions
- **businessHours**: Weekly schedule with open/close times
- **vendor**: Reference to the User who owns this business (required)
- **isActive**: Whether the business is currently active
- **isVerified**: Admin verification status
- **isFeatured**: Featured business status
- **rating**: Average rating and total review count
- **priceRange**: Price range indicator ($, $$, $$$, $$$$)
- **tags**: Array of searchable tags
- **amenities**: Available amenities/features
- **services**: Detailed service offerings with prices
- **views**: Total view count

## API Endpoints

### 1. Create Business
- **POST** `/api/businesses`
- **Access**: Private (Vendor only)
- **Description**: Create a new business listing

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "category": "restaurant",
  "subcategory": "Italian",
  "description": "Authentic Italian pizza made with fresh ingredients...",
  "location": {
    "address": {
      "street": "123 Main Street",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    },
    "coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "contactInfo": {
    "phone": "+1-555-0123",
    "email": "contact@pizzapalace.com",
    "website": "https://pizzapalace.com"
  },
  "imageUrl": "https://example.com/pizza.jpg",
  "businessHours": {
    "monday": { "open": "11:00", "close": "22:00", "closed": false }
  },
  "priceRange": "$$",
  "tags": ["italian", "pizza", "authentic"],
  "amenities": ["takeout", "delivery", "dine-in"]
}
```

### 2. Get All Businesses
- **GET** `/api/businesses`
- **Access**: Public
- **Description**: Retrieve businesses with filtering and pagination

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 50)
- `category` (string): Filter by business category
- `city` (string): Filter by city
- `state` (string): Filter by state
- `rating` (float): Minimum rating filter
- `priceRange` (string): Filter by price range ($, $$, $$$, $$$$)
- `search` (string): Text search in name, description, and tags
- `lat` (float): Latitude for location-based search
- `lng` (float): Longitude for location-based search
- `radius` (float): Search radius in miles (default: 10)
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order 'asc' or 'desc' (default: 'desc')
- `isActive` (boolean): Filter by active status (default: true)
- `isFeatured` (boolean): Filter by featured status

**Example Request:**
```
GET /api/businesses?category=restaurant&city=San Francisco&rating=4&page=1&limit=10
```

### 3. Get Single Business
- **GET** `/api/businesses/:id`
- **Access**: Public
- **Description**: Get detailed information about a specific business

### 4. Update Business
- **PUT** `/api/businesses/:id`
- **Access**: Private (Business owner or Admin)
- **Description**: Update business information

### 5. Delete Business
- **DELETE** `/api/businesses/:id`
- **Access**: Private (Business owner or Admin)
- **Description**: Delete a business listing

### 6. Get Vendor's Businesses
- **GET** `/api/businesses/vendor/:vendorId`
- **Access**: Public
- **Description**: Get all businesses for a specific vendor

### 7. Toggle Business Status
- **POST** `/api/businesses/:id/toggle-status`
- **Access**: Private (Business owner or Admin)
- **Description**: Activate or deactivate a business

### 8. Verify Business
- **POST** `/api/businesses/:id/verify`
- **Access**: Private (Admin only)
- **Description**: Verify or unverify a business

## Response Format

All endpoints return responses in the following format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "business": { /* business object */ },
  "businesses": [ /* array of businesses */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBusinesses": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

## Business Categories

Supported business categories:
- `restaurant`
- `retail`
- `services`
- `healthcare`
- `automotive`
- `beauty`
- `fitness`
- `education`
- `technology`
- `entertainment`
- `real-estate`
- `finance`
- `legal`
- `travel`
- `other`

## Search and Filtering Features

### Geographic Search
Use `lat`, `lng`, and `radius` parameters to find businesses within a specific area:
```
GET /api/businesses?lat=37.7749&lng=-122.4194&radius=5
```

### Text Search
Use the `search` parameter to search across business names, descriptions, and tags:
```
GET /api/businesses?search=pizza italian
```

### Combined Filters
Combine multiple filters for precise results:
```
GET /api/businesses?category=restaurant&priceRange=$$&rating=4&city=San Francisco
```

## Authentication

- **Vendor Registration**: Users with `vendor` role can create and manage businesses
- **JWT Token**: Include `Authorization: Bearer <token>` header for protected routes
- **Role-based Access**: Different permissions for customers, vendors, and admins

## Validation Rules

- Business names must be unique per vendor
- Phone numbers must follow international format
- Email addresses must be valid
- Website URLs must include protocol (http/https)
- ZIP codes must follow US format (12345 or 12345-6789)
- Coordinates must be within valid latitude/longitude ranges
- Image URLs must point to valid image files

## Example Usage

### Creating a Business
```javascript
const response = await fetch('/api/businesses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    name: 'My Restaurant',
    category: 'restaurant',
    description: 'Great food and service...',
    location: {
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      }
    },
    contactInfo: {
      phone: '+1-555-0123'
    }
  })
});
```

### Searching Businesses
```javascript
const response = await fetch('/api/businesses?search=pizza&category=restaurant&rating=4');
const data = await response.json();
console.log(data.businesses);
```
