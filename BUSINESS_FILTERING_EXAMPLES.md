# Business API Filtering and Pagination Examples

This document provides comprehensive examples of how to use the Business API endpoints for filtering, pagination, and sorting.

## Base URL
```
/api/businesses
```

## 1. Basic Filtering Examples

### Filter by Category
```bash
# Get all restaurants
GET /api/businesses?category=restaurant

# Get all technology businesses
GET /api/businesses?category=technology
```

### Filter by Location
```bash
# Get businesses in San Francisco
GET /api/businesses?city=San Francisco

# Get businesses in California
GET /api/businesses?state=CA

# Get businesses by ZIP code
GET /api/businesses?zipCode=94102

# Combine city and state
GET /api/businesses?city=Los Angeles&state=CA
```

### Filter by Rating and Price
```bash
# Get businesses with 4+ star rating
GET /api/businesses?rating=4

# Get budget-friendly businesses
GET /api/businesses?priceRange=$

# Get high-end businesses
GET /api/businesses?priceRange=$$$$

# Combine rating and price
GET /api/businesses?rating=4&priceRange=$$
```

## 2. Search and Text Filtering

### Text Search
```bash
# Search for pizza places
GET /api/businesses?search=pizza

# Search for multiple terms
GET /api/businesses?search=pizza italian authentic

# Combine search with category
GET /api/businesses?search=repair&category=technology
```

### Tag-based Filtering
```bash
# Search by tags
GET /api/businesses?tags=delivery,takeout

# Single tag
GET /api/businesses?tags=parking
```

## 3. Geographic Filtering

### Location-based Search
```bash
# Find businesses within 5 miles of coordinates
GET /api/businesses?lat=37.7749&lng=-122.4194&radius=5

# Find nearby restaurants
GET /api/businesses?lat=37.7749&lng=-122.4194&radius=10&category=restaurant

# Sort by distance
GET /api/businesses?lat=37.7749&lng=-122.4194&sortBy=distance
```

## 4. Pagination Examples

### Basic Pagination
```bash
# First page (default)
GET /api/businesses?page=1

# Second page with 20 items per page
GET /api/businesses?page=2&limit=20

# Custom page size
GET /api/businesses?limit=5
```

### Pagination with Filters
```bash
# Paginate restaurants in San Francisco
GET /api/businesses?category=restaurant&city=San Francisco&page=1&limit=10
```

## 5. Sorting Options

### Sort by Different Fields
```bash
# Sort by name (alphabetical)
GET /api/businesses?sortBy=name&sortOrder=asc

# Sort by rating (highest first)
GET /api/businesses?sortBy=rating&sortOrder=desc

# Sort by popularity (most viewed)
GET /api/businesses?sortBy=views&sortOrder=desc

# Sort by newest first
GET /api/businesses?sortBy=createdAt&sortOrder=desc

# Sort by relevance (default for search)
GET /api/businesses?search=pizza&sortBy=relevance
```

## 6. Quality Filters

### Verification and Images
```bash
# Only verified businesses
GET /api/businesses?isVerified=true

# Only businesses with images
GET /api/businesses?hasImages=true

# Only featured businesses
GET /api/businesses?isFeatured=true

# Combine quality filters
GET /api/businesses?isVerified=true&hasImages=true&rating=4
```

### Business Status
```bash
# Only open businesses (simplified)
GET /api/businesses?openNow=true

# Include inactive businesses (admin use)
GET /api/businesses?isActive=false
```

## 7. Complex Query Examples

### Multi-filter Restaurant Search
```bash
# High-rated Italian restaurants in San Francisco with delivery
GET /api/businesses?category=restaurant&city=San Francisco&rating=4&tags=delivery,italian&sortBy=rating&sortOrder=desc
```

### Technology Services Near Me
```bash
# Tech repair services within 10 miles, sorted by distance
GET /api/businesses?category=technology&lat=37.7749&lng=-122.4194&radius=10&sortBy=distance&hasImages=true
```

### Budget Beauty Services
```bash
# Affordable beauty services with good ratings
GET /api/businesses?category=beauty&priceRange=$,$$&rating=3.5&sortBy=rating&limit=15
```

## 8. Specialized Endpoints

### Get Business Categories
```bash
# Get all categories with business counts
GET /api/businesses/categories

# Response example:
{
  "success": true,
  "categories": [
    { "category": "restaurant", "count": 45 },
    { "category": "retail", "count": 32 },
    { "category": "services", "count": 28 }
  ]
}
```

### Get Business Locations
```bash
# Get cities with business counts
GET /api/businesses/locations?type=city

# Get states with business counts
GET /api/businesses/locations?type=state
```

### Featured Businesses
```bash
# Get featured restaurants
GET /api/businesses/featured?category=restaurant&limit=6

# Featured businesses in specific location
GET /api/businesses/featured?location=San Francisco
```

### Nearby Businesses
```bash
# Get nearby businesses with minimum rating
GET /api/businesses/nearby?lat=37.7749&lng=-122.4194&radius=5&minRating=4&limit=10

# Nearby restaurants sorted by rating
GET /api/businesses/nearby?lat=37.7749&lng=-122.4194&category=restaurant&sortBy=rating
```

### Advanced Search
```bash
# Multi-category search with faceted results
GET /api/businesses/search/advanced?q=coffee&categories=restaurant,retail&priceRanges=$,$$&minRating=3&hasImages=true

# Advanced search response includes facets for filtering UI
{
  "success": true,
  "businesses": [...],
  "pagination": {...},
  "facets": {
    "categories": [...],
    "priceRanges": [...],
    "ratings": [...]
  },
  "appliedFilters": {...}
}
```

## 9. Response Format Examples

### Standard Business List Response
```json
{
  "success": true,
  "businesses": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "Pizza Palace",
      "category": "restaurant",
      "subcategory": "Italian",
      "description": "Authentic Italian pizza...",
      "location": {
        "address": {
          "street": "123 Main Street",
          "city": "San Francisco",
          "state": "CA",
          "zipCode": "94102"
        },
        "coordinates": {
          "type": "Point",
          "coordinates": [-122.4194, 37.7749]
        }
      },
      "rating": {
        "average": 4.5,
        "totalReviews": 127
      },
      "priceRange": "$$",
      "isVerified": true,
      "isFeatured": true,
      "distance": 2.34,
      "vendor": {
        "username": "pizzapalace",
        "firstName": "Mario",
        "lastName": "Rossi",
        "isVerifiedVendor": true
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBusinesses": 48,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  },
  "filters": {
    "category": "restaurant",
    "city": "San Francisco",
    "rating": 4,
    "priceRange": "$$",
    "tags": ["delivery", "takeout"],
    "isVerified": true,
    "hasImages": true,
    "openNow": false
  },
  "sorting": {
    "sortBy": "rating",
    "sortOrder": "desc",
    "isLocationBased": true
  },
  "searchQuery": null,
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "radius": 10
  }
}
```

## 10. Error Handling Examples

### Validation Errors
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "msg": "Page must be a positive integer",
      "param": "page",
      "value": "0"
    }
  ]
}
```

### Server Errors
```json
{
  "success": false,
  "message": "Server error while fetching businesses"
}
```

## 11. Performance Tips

### Optimizing Queries
```bash
# Use specific filters to reduce result set
GET /api/businesses?category=restaurant&city=San Francisco&isVerified=true

# Use appropriate page sizes
GET /api/businesses?limit=20  # Good for grids
GET /api/businesses?limit=50  # Maximum allowed

# Use location-based queries efficiently
GET /api/businesses?lat=37.7749&lng=-122.4194&radius=5&category=restaurant
```

### Best Practices
1. **Combine Filters**: Use multiple filters to get more targeted results
2. **Use Pagination**: Always use pagination for large result sets
3. **Location Queries**: Provide coordinates for distance-based sorting
4. **Caching**: Consider caching results for frequently used filter combinations
5. **Error Handling**: Always check the `success` field in responses

## 12. Frontend Integration Examples

### JavaScript/React Example
```javascript
// Fetch restaurants with pagination
const fetchBusinesses = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    category: filters.category || '',
    city: filters.city || '',
    rating: filters.rating || '',
    sortBy: filters.sortBy || 'rating',
    sortOrder: filters.sortOrder || 'desc'
  });

  try {
    const response = await fetch(`/api/businesses?${params}`);
    const data = await response.json();
    
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching businesses:', error);
    throw error;
  }
};

// Usage
const restaurantData = await fetchBusinesses({
  category: 'restaurant',
  city: 'San Francisco',
  rating: 4,
  page: 1,
  limit: 20
});
```

### Location-based Search Example
```javascript
// Get user location and find nearby businesses
const findNearbyBusinesses = async (category = '') => {
  if ('geolocation' in navigator) {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    
    const { latitude, longitude } = position.coords;
    
    const params = new URLSearchParams({
      lat: latitude,
      lng: longitude,
      radius: 10,
      category,
      sortBy: 'distance',
      limit: 20
    });
    
    const response = await fetch(`/api/businesses?${params}`);
    return await response.json();
  }
};
```

This comprehensive filtering and pagination system provides flexibility for various use cases while maintaining good performance and user experience.
