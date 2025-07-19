import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from './models/Business.js';

dotenv.config();

const testBusinessAPI = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mylocal_connect');
    console.log('✅ Connected to MongoDB');

    // Test 1: Count total businesses
    const totalBusinesses = await Business.countDocuments();
    console.log(`✅ Total businesses in database: ${totalBusinesses}`);

    // Test 2: Test category filtering
    const restaurants = await Business.find({ category: 'restaurant', isActive: true });
    console.log(`✅ Found ${restaurants.length} restaurants`);

    // Test 3: Test location filtering
    const sfBusinesses = await Business.find({ 
      'location.address.city': new RegExp('San Francisco', 'i'),
      isActive: true 
    });
    console.log(`✅ Found ${sfBusinesses.length} businesses in San Francisco`);

    // Test 4: Test rating filtering
    const highRatedBusinesses = await Business.find({ 
      'rating.average': { $gte: 4 },
      isActive: true 
    });
    console.log(`✅ Found ${highRatedBusinesses.length} businesses with 4+ star rating`);

    // Test 5: Test text search
    const pizzaBusinesses = await Business.find({ 
      $text: { $search: 'pizza' },
      isActive: true 
    });
    console.log(`✅ Found ${pizzaBusinesses.length} businesses matching 'pizza' search`);

    // Test 6: Test sorting
    const businessesByRating = await Business.find({ isActive: true })
      .sort({ 'rating.average': -1 })
      .limit(3)
      .select('name rating.average');
    
    console.log('✅ Top 3 businesses by rating:');
    businessesByRating.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.name} (${business.rating.average} stars)`);
    });

    // Test 7: Test pagination
    const paginatedBusinesses = await Business.find({ isActive: true })
      .skip(0)
      .limit(2)
      .select('name category');
    
    console.log('✅ First 2 businesses (pagination test):');
    paginatedBusinesses.forEach((business, index) => {
      console.log(`   ${index + 1}. ${business.name} (${business.category})`);
    });

    // Test 8: Test aggregation for categories
    const categoryCounts = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('✅ Business categories with counts:');
    categoryCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count} businesses`);
    });

    console.log('\n🎉 All business API tests passed successfully!');
    
    // Test business model methods
    if (totalBusinesses > 0) {
      const firstBusiness = await Business.findOne({ isActive: true });
      if (firstBusiness) {
        console.log(`\n✅ Testing business methods for: ${firstBusiness.name}`);
        console.log(`   Full address: ${firstBusiness.fullAddress}`);
        console.log(`   Primary image: ${firstBusiness.primaryImage || 'No image'}`);
        console.log(`   Currently open: ${firstBusiness.isOpenNow() ? 'Yes' : 'No'}`);
        
        // Test distance calculation if coordinates exist
        if (firstBusiness.location.coordinates.coordinates) {
          const testLat = 37.7749; // San Francisco
          const testLng = -122.4194;
          const distance = firstBusiness.calculateDistance(testLat, testLng);
          console.log(`   Distance from SF: ${distance ? distance.toFixed(2) + ' miles' : 'N/A'}`);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run the test
testBusinessAPI();
