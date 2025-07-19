import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mylocal_connect');
    
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    
    console.log('Existing data cleared');

    // Create sample users
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        bio: 'System administrator',
        location: 'New York, NY',
        isVerified: true
      },
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        bio: 'Local community member and food enthusiast',
        location: 'San Francisco, CA'
      },
      {
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'customer',
        bio: 'Event organizer and community volunteer',
        location: 'Los Angeles, CA'
      },
      {
        username: 'pizzapalace',
        email: 'owner@pizzapalace.com',
        password: 'vendor123',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'vendor',
        bio: 'Owner of Pizza Palace',
        location: 'San Francisco, CA',
        businessName: 'Pizza Palace',
        businessDescription: 'Authentic Italian pizza made with fresh ingredients and traditional recipes passed down through generations.',
        businessAddress: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102'
        },
        businessPhone: '+1-555-0123',
        businessWebsite: 'https://pizzapalace.com',
        businessCategories: ['restaurant'],
        businessHours: {
          monday: { open: '11:00', close: '22:00', closed: false },
          tuesday: { open: '11:00', close: '22:00', closed: false },
          wednesday: { open: '11:00', close: '22:00', closed: false },
          thursday: { open: '11:00', close: '22:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '11:00', close: '23:00', closed: false },
          sunday: { open: '12:00', close: '21:00', closed: false }
        },
        isVerifiedVendor: true,
        vendorRating: 4.5,
        totalReviews: 127
      },
      {
        username: 'techrepair',
        email: 'contact@techrepair.com',
        password: 'vendor123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'vendor',
        bio: 'Certified technician with 10+ years experience',
        location: 'Los Angeles, CA',
        businessName: 'TechRepair Pro',
        businessDescription: 'Professional computer and mobile device repair services. We fix all brands and models with quick turnaround times.',
        businessAddress: {
          street: '456 Tech Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210'
        },
        businessPhone: '+1-555-0456',
        businessWebsite: 'https://techrepairpro.com',
        businessCategories: ['technology', 'services'],
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '', close: '', closed: true }
        },
        isVerifiedVendor: true,
        vendorRating: 4.8,
        totalReviews: 89
      },
      {
        username: 'beautysalon',
        email: 'info@bellasalon.com',
        password: 'vendor123',
        firstName: 'Isabella',
        lastName: 'Garcia',
        role: 'vendor',
        bio: 'Licensed cosmetologist and salon owner',
        location: 'New York, NY',
        businessName: 'Bella Beauty Salon',
        businessDescription: 'Full-service beauty salon offering haircuts, styling, coloring, manicures, pedicures, and facial treatments.',
        businessAddress: {
          street: '789 Beauty Boulevard',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        businessPhone: '+1-555-0789',
        businessWebsite: 'https://bellasalon.com',
        businessCategories: ['beauty', 'services'],
        businessHours: {
          monday: { open: '', close: '', closed: true },
          tuesday: { open: '09:00', close: '19:00', closed: false },
          wednesday: { open: '09:00', close: '19:00', closed: false },
          thursday: { open: '09:00', close: '19:00', closed: false },
          friday: { open: '09:00', close: '19:00', closed: false },
          saturday: { open: '08:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        isVerifiedVendor: false, // Pending verification
        vendorRating: 0,
        totalReviews: 0
      }
    ];

    const createdUsers = await User.create(users);
    console.log('Sample users created');

    // Create sample posts
    const posts = [
      {
        title: 'Welcome to MyLocal Connect!',
        content: 'This is a community platform where neighbors can connect, share local events, and support local businesses. Join us in building a stronger community!',
        category: 'community',
        tags: ['welcome', 'community', 'introduction'],
        author: createdUsers[0]._id,
        location: 'General'
      },
      {
        title: 'Local Farmers Market This Saturday',
        content: 'Don\'t miss our weekly farmers market this Saturday from 8 AM to 2 PM at Central Park. Fresh produce, local crafts, and delicious food trucks!',
        category: 'events',
        tags: ['farmers market', 'saturday', 'local', 'food'],
        author: createdUsers[1]._id, // John Doe (customer)
        location: 'Central Park'
      },
      {
        title: 'Grand Opening - Pizza Palace',
        content: 'We\'re excited to announce the grand opening of Pizza Palace! Come try our authentic Italian pizzas made with the finest ingredients. Special 20% discount for the first week!',
        category: 'business',
        tags: ['pizza', 'italian', 'grand opening', 'discount'],
        author: createdUsers[3]._id, // Pizza Palace vendor
        location: '123 Main Street, San Francisco'
      },
      {
        title: 'Need Computer Repair? We\'ve Got You Covered!',
        content: 'TechRepair Pro offers professional computer and mobile device repair services. Quick turnaround, competitive prices, and quality guaranteed. Free diagnostics!',
        category: 'services',
        tags: ['computer repair', 'mobile repair', 'technology', 'professional'],
        author: createdUsers[4]._id, // TechRepair vendor
        location: '456 Tech Avenue, Los Angeles'
      },
      {
        title: 'Community Clean-up Day Volunteers Needed',
        content: 'We\'re organizing a community clean-up day next weekend. Join us to help keep our neighborhood beautiful! All supplies will be provided.',
        category: 'community',
        tags: ['volunteer', 'clean-up', 'community service'],
        author: createdUsers[1]._id,
        location: 'Various locations'
      }
    ];

    const createdPosts = await Post.create(posts);
    console.log('Sample posts created');

    // Add some likes and comments
    await createdPosts[0].addLike(createdUsers[1]._id);
    await createdPosts[0].addLike(createdUsers[2]._id);
    await createdPosts[0].addComment(createdUsers[1]._id, 'Great initiative! Looking forward to connecting with neighbors.');

    await createdPosts[1].addLike(createdUsers[0]._id);
    await createdPosts[1].addComment(createdUsers[2]._id, 'I\'ll definitely be there! Love supporting local farmers.');

    console.log('Sample interactions added');
    console.log('Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
