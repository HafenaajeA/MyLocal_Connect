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
        bio: 'Local community member and business owner',
        location: 'San Francisco, CA'
      },
      {
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Event organizer and community volunteer',
        location: 'Los Angeles, CA'
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
        author: createdUsers[1]._id,
        location: 'Central Park'
      },
      {
        title: 'New Coffee Shop Opening Soon',
        content: 'Excited to announce that Brew & Bean Coffee will be opening next month on Main Street. They\'ll offer locally roasted coffee and homemade pastries.',
        category: 'business',
        tags: ['coffee', 'new business', 'main street'],
        author: createdUsers[2]._id,
        location: 'Main Street'
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
