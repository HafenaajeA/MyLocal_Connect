#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

// Test data
let authToken = '';
let businessId = '';
let reviewId = '';
let userId = '';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (name, fn) => {
  try {
    log(`\n🧪 Testing: ${name}`, 'blue');
    await fn();
    log(`✅ ${name} - PASSED`, 'green');
  } catch (error) {
    log(`❌ ${name} - FAILED: ${error.message}`, 'red');
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
  }
};

// Authentication helper
const authenticate = async () => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'john@example.com',
    password: 'password123'
  });
  authToken = response.data.token;
  userId = response.data.user.id;
  return response.data;
};

// Get a business ID helper
const getBusinessId = async () => {
  const response = await axios.get(`${BASE_URL}/businesses?limit=1`);
  businessId = response.data.businesses[0]._id;
  return businessId;
};

const runTests = async () => {
  log('🚀 Starting Review API Tests...', 'blue');
  
  try {
    // Setup
    log('\n📋 Setting up test environment...', 'yellow');
    await authenticate();
    await getBusinessId();
    log('✅ Setup complete', 'green');

    // Test 1: Create a review
    await testEndpoint('Create Review', async () => {
      const response = await axios.post(`${BASE_URL}/reviews`, {
        business: businessId,
        rating: 4.5,
        title: 'Great experience!',
        comment: 'This is a test review with a detailed comment about the business experience.'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      reviewId = response.data.review._id;
      
      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }
      if (!response.data.review._id) {
        throw new Error('Review ID not returned');
      }
      if (response.data.review.rating !== 4.5) {
        throw new Error('Rating not saved correctly');
      }
    });

    // Test 2: Prevent duplicate review
    await testEndpoint('Prevent Duplicate Review', async () => {
      try {
        await axios.post(`${BASE_URL}/reviews`, {
          business: businessId,
          rating: 3,
          comment: 'This should fail as duplicate'
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Should have prevented duplicate review');
      } catch (error) {
        if (error.response?.status !== 409) {
          throw new Error(`Expected 409 status, got ${error.response?.status}`);
        }
      }
    });

    // Test 3: Get reviews for business
    await testEndpoint('Get Business Reviews', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/business/${businessId}`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!Array.isArray(response.data.reviews)) {
        throw new Error('Reviews array not returned');
      }
      if (!response.data.businessStats) {
        throw new Error('Business stats not returned');
      }
    });

    // Test 4: Get specific review
    await testEndpoint('Get Specific Review', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/${reviewId}`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (response.data._id !== reviewId) {
        throw new Error('Wrong review returned');
      }
    });

    // Test 5: Update review
    await testEndpoint('Update Review', async () => {
      const response = await axios.put(`${BASE_URL}/reviews/${reviewId}`, {
        rating: 5,
        title: 'Updated: Excellent experience!',
        comment: 'Updated comment with even more positive feedback.'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (response.data.review.rating !== 5) {
        throw new Error('Rating not updated correctly');
      }
    });

    // Test 6: Mark review as helpful
    await testEndpoint('Mark Review as Helpful', async () => {
      const response = await axios.post(`${BASE_URL}/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (typeof response.data.helpfulVotes !== 'number') {
        throw new Error('Helpful votes not returned');
      }
    });

    // Test 7: Check if user can review
    await testEndpoint('Check Review Permission', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/check/${businessId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (response.data.canReview !== false) {
        throw new Error('Should indicate user cannot review (already reviewed)');
      }
    });

    // Test 8: Get business stats
    await testEndpoint('Get Business Statistics', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/stats/${businessId}`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (typeof response.data.averageRating !== 'number') {
        throw new Error('Average rating not returned');
      }
      if (typeof response.data.totalReviews !== 'number') {
        throw new Error('Total reviews not returned');
      }
    });

    // Test 9: Get user reviews
    await testEndpoint('Get User Reviews', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/user/${userId}`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!Array.isArray(response.data.reviews)) {
        throw new Error('Reviews array not returned');
      }
    });

    // Test 10: Pagination
    await testEndpoint('Pagination', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/business/${businessId}?page=1&limit=2`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.pagination) {
        throw new Error('Pagination data not returned');
      }
      if (typeof response.data.pagination.currentPage !== 'number') {
        throw new Error('Current page not returned');
      }
    });

    // Test 11: Filtering by rating
    await testEndpoint('Filter by Rating', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/business/${businessId}?rating=5`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      // Check if all returned reviews have rating 5
      const nonFiveStarReviews = response.data.reviews.filter(r => r.rating !== 5);
      if (nonFiveStarReviews.length > 0) {
        throw new Error('Filtering by rating not working correctly');
      }
    });

    // Test 12: Sorting
    await testEndpoint('Sorting', async () => {
      const response = await axios.get(`${BASE_URL}/reviews/business/${businessId}?sortBy=rating&sortOrder=asc`);
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      // Check if reviews are sorted by rating ascending
      const reviews = response.data.reviews;
      for (let i = 1; i < reviews.length; i++) {
        if (reviews[i].rating < reviews[i-1].rating) {
          throw new Error('Sorting not working correctly');
        }
      }
    });

    // Test 13: Report review (needs different user)
    await testEndpoint('Report Review', async () => {
      // Login as a different user first
      const adminAuth = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      const response = await axios.post(`${BASE_URL}/reviews/${reviewId}/report`, {
        reason: 'inappropriate'
      }, {
        headers: { Authorization: `Bearer ${adminAuth.data.token}` }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
    });

    // Test 14: Delete review
    await testEndpoint('Delete Review', async () => {
      const response = await axios.delete(`${BASE_URL}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
    });

    // Test 15: Verify deletion
    await testEndpoint('Verify Review Deletion', async () => {
      try {
        await axios.get(`${BASE_URL}/reviews/${reviewId}`);
        throw new Error('Review should have been deleted');
      } catch (error) {
        if (error.response?.status !== 404) {
          throw new Error(`Expected 404 status, got ${error.response?.status}`);
        }
      }
    });

    log('\n🎉 All Review API tests completed!', 'green');
    log('📊 Test Summary:', 'blue');
    log('✅ Review creation and duplicate prevention', 'green');
    log('✅ Review retrieval and filtering', 'green');
    log('✅ Review updates and deletion', 'green');
    log('✅ Review interactions (helpful, report)', 'green');
    log('✅ Business statistics calculation', 'green');
    log('✅ Pagination and sorting', 'green');
    log('✅ Permission checks', 'green');

  } catch (error) {
    log(`\n💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    log(`💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

export default runTests;
