import mongoose from 'mongoose';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Business from '../models/Business.js';
import Review from '../models/Review.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mylocal_connect');
    
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Business.deleteMany({});
    await Review.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    
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

    // Create sample businesses
    const businesses = [
      {
        name: 'Pizza Palace',
        category: 'restaurant',
        subcategory: 'Italian',
        description: 'Authentic Italian pizza made with fresh ingredients and traditional recipes passed down through generations. We use only the finest San Marzano tomatoes, fresh mozzarella, and imported Italian meats.',
        location: {
          address: {
            street: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'United States'
          },
          coordinates: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749] // [longitude, latitude]
          }
        },
        contactInfo: {
          phone: '+1-555-0123',
          email: 'contact@pizzapalace.com',
          website: 'https://pizzapalace.com',
          socialMedia: {
            facebook: 'https://facebook.com/pizzapalace',
            instagram: 'https://instagram.com/pizzapalace'
          }
        },
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
            caption: 'Our signature Margherita pizza',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
            caption: 'Cozy restaurant interior'
          }
        ],
        businessHours: {
          monday: { open: '11:00', close: '22:00', closed: false },
          tuesday: { open: '11:00', close: '22:00', closed: false },
          wednesday: { open: '11:00', close: '22:00', closed: false },
          thursday: { open: '11:00', close: '22:00', closed: false },
          friday: { open: '11:00', close: '23:00', closed: false },
          saturday: { open: '11:00', close: '23:00', closed: false },
          sunday: { open: '12:00', close: '21:00', closed: false }
        },
        vendor: createdUsers[3]._id, // Pizza Palace vendor
        isActive: true,
        isVerified: true,
        isFeatured: true,
        rating: {
          average: 4.5,
          totalReviews: 127
        },
        priceRange: '$$',
        tags: ['italian', 'pizza', 'authentic', 'family-friendly'],
        amenities: ['takeout', 'delivery', 'dine-in', 'parking'],
        services: [
          {
            name: 'Dine-in Service',
            description: 'Full restaurant service with table seating',
            price: 0,
            duration: '1-2 hours'
          },
          {
            name: 'Takeout',
            description: 'Order ahead for quick pickup',
            price: 0,
            duration: '15-20 minutes'
          },
          {
            name: 'Delivery',
            description: 'Hot pizza delivered to your door',
            price: 3.99,
            duration: '30-45 minutes'
          }
        ],
        views: 1250
      },
      {
        name: 'TechRepair Pro',
        category: 'technology',
        subcategory: 'Repair Services',
        description: 'Professional computer and mobile device repair services with over 10 years of experience. We specialize in hardware repairs, software troubleshooting, and data recovery for all major brands.',
        location: {
          address: {
            street: '456 Tech Avenue',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'United States'
          },
          coordinates: {
            type: 'Point',
            coordinates: [-118.2437, 34.0522] // [longitude, latitude]
          }
        },
        contactInfo: {
          phone: '+1-555-0456',
          email: 'contact@techrepairpro.com',
          website: 'https://techrepairpro.com',
          socialMedia: {
            linkedin: 'https://linkedin.com/company/techrepairpro'
          }
        },
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13',
            caption: 'Professional repair workspace',
            isPrimary: true
          }
        ],
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '', close: '', closed: true }
        },
        vendor: createdUsers[4]._id, // TechRepair vendor
        isActive: true,
        isVerified: true,
        isFeatured: false,
        rating: {
          average: 4.8,
          totalReviews: 89
        },
        priceRange: '$$',
        tags: ['computer repair', 'mobile repair', 'data recovery', 'professional'],
        amenities: ['free diagnostics', 'warranty', 'pickup service'],
        services: [
          {
            name: 'Computer Repair',
            description: 'Hardware and software repair for laptops and desktops',
            price: 75,
            duration: '1-3 days'
          },
          {
            name: 'Mobile Device Repair',
            description: 'Screen replacement and hardware repair for smartphones and tablets',
            price: 50,
            duration: '1-2 hours'
          },
          {
            name: 'Data Recovery',
            description: 'Recover lost data from damaged storage devices',
            price: 150,
            duration: '3-7 days'
          }
        ],
        views: 892
      },
      {
        name: 'Bella Beauty Salon',
        category: 'beauty',
        subcategory: 'Full Service Salon',
        description: 'Full-service beauty salon offering professional haircuts, styling, coloring, manicures, pedicures, and facial treatments. Our licensed cosmetologists provide personalized beauty services in a relaxing environment.',
        location: {
          address: {
            street: '789 Beauty Boulevard',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States'
          },
          coordinates: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128] // [longitude, latitude]
          }
        },
        contactInfo: {
          phone: '+1-555-0789',
          email: 'info@bellasalon.com',
          website: 'https://bellasalon.com',
          socialMedia: {
            instagram: 'https://instagram.com/bellasalon',
            facebook: 'https://facebook.com/bellasalon'
          }
        },
        imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df',
            caption: 'Modern salon interior',
            isPrimary: true
          }
        ],
        businessHours: {
          monday: { open: '', close: '', closed: true },
          tuesday: { open: '09:00', close: '19:00', closed: false },
          wednesday: { open: '09:00', close: '19:00', closed: false },
          thursday: { open: '09:00', close: '19:00', closed: false },
          friday: { open: '09:00', close: '19:00', closed: false },
          saturday: { open: '08:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        },
        vendor: createdUsers[5]._id, // Beauty salon vendor
        isActive: true,
        isVerified: false, // Pending verification
        isFeatured: false,
        rating: {
          average: 0,
          totalReviews: 0
        },
        priceRange: '$$$',
        tags: ['haircut', 'styling', 'manicure', 'pedicure', 'facial'],
        amenities: ['appointment booking', 'consultation', 'parking'],
        services: [
          {
            name: 'Haircut & Style',
            description: 'Professional haircut with styling',
            price: 85,
            duration: '1 hour'
          },
          {
            name: 'Hair Coloring',
            description: 'Full color or highlights with professional products',
            price: 150,
            duration: '2-3 hours'
          },
          {
            name: 'Manicure',
            description: 'Complete nail care and polish',
            price: 35,
            duration: '45 minutes'
          },
          {
            name: 'Pedicure',
            description: 'Complete foot care and polish',
            price: 45,
            duration: '1 hour'
          }
        ],
        views: 234
      }
    ];

    const createdBusinesses = await Business.create(businesses);
    console.log('Sample businesses created');

    // Create sample reviews
    const reviews = [
      {
        user: createdUsers[1]._id, // John Doe
        business: createdBusinesses[0]._id, // Pizza Palace
        rating: 5,
        title: 'Excellent Pizza!',
        comment: 'This place has the best pizza in town! The ingredients are fresh and the atmosphere is perfect for dining with family. Highly recommend the Margherita pizza.'
      },
      {
        user: createdUsers[2]._id, // Jane Smith
        business: createdBusinesses[0]._id, // Pizza Palace
        rating: 4.5,
        title: 'Great local spot',
        comment: 'Love this pizza place! Great selection and the food is fresh. Sometimes gets a bit crowded during peak hours but definitely worth the wait.'
      },
      {
        user: createdUsers[1]._id, // John Doe
        business: createdBusinesses[1]._id, // TechRepair Pro
        rating: 4,
        title: 'Solid tech support',
        comment: 'Good tech repair service with fair pricing. The staff explained the problem clearly and fixed my phone screen quickly. Professional service.'
      },
      {
        user: createdUsers[2]._id, // Jane Smith
        business: createdBusinesses[1]._id, // TechRepair Pro
        rating: 5,
        title: 'Saved my computer!',
        comment: 'My laptop was completely dead and I thought I lost everything. The team at TechRepair not only fixed it but recovered all my important files. Professional, fast, and reasonably priced!'
      },
      {
        user: createdUsers[0]._id, // Admin
        business: createdBusinesses[1]._id, // TechRepair Pro
        rating: 4,
        title: 'Reliable tech support',
        comment: 'Good service and knowledgeable technicians. They explained the problem clearly and fixed my phone screen quickly. Prices are fair for the quality of work.'
      },
      {
        user: createdUsers[0]._id, // Admin
        business: createdBusinesses[2]._id, // Bella Beauty Salon
        rating: 5,
        title: 'Relaxing and professional',
        comment: 'What a wonderful spa experience! The massage was incredibly relaxing and the facial left my skin glowing. The staff is professional and the atmosphere is so peaceful.'
      },
      {
        user: createdUsers[1]._id, // John Doe
        business: createdBusinesses[2]._id, // Bella Beauty Salon
        rating: 4.5,
        title: 'Great haircut and service',
        comment: 'Got an excellent haircut here. The stylist listened to what I wanted and delivered exactly that. The salon is clean, modern, and the staff is friendly and professional.'
      }
    ];

    const createdReviews = await Review.create(reviews);
    console.log('Sample reviews created');

    // Create sample chats between customers and vendors
    const chats = [
      {
        participants: [
          {
            user: createdUsers[1]._id, // John Doe (customer)
            role: 'customer',
            lastRead: new Date()
          },
          {
            user: createdUsers[3]._id, // Mike Johnson (vendor - Pizza Palace)
            role: 'vendor',
            lastRead: new Date()
          }
        ],
        business: createdBusinesses[0]._id, // Pizza Palace
        metadata: {
          customerInfo: {
            name: 'John Doe',
            avatar: ''
          },
          vendorInfo: {
            businessName: 'Pizza Palace',
            avatar: ''
          }
        }
      },
      {
        participants: [
          {
            user: createdUsers[2]._id, // Jane Smith (customer)
            role: 'customer',
            lastRead: new Date()
          },
          {
            user: createdUsers[4]._id, // Sarah Davis (vendor - TechRepair Pro)
            role: 'vendor',
            lastRead: new Date()
          }
        ],
        business: createdBusinesses[1]._id, // TechRepair Pro
        metadata: {
          customerInfo: {
            name: 'Jane Smith',
            avatar: ''
          },
          vendorInfo: {
            businessName: 'TechRepair Pro',
            avatar: ''
          }
        }
      },
      {
        participants: [
          {
            user: createdUsers[1]._id, // John Doe (customer)
            role: 'customer',
            lastRead: new Date()
          },
          {
            user: createdUsers[5]._id, // Emily Wilson (vendor - Bella Beauty Salon)
            role: 'vendor',
            lastRead: new Date()
          }
        ],
        business: createdBusinesses[2]._id, // Bella Beauty Salon
        metadata: {
          customerInfo: {
            name: 'John Doe',
            avatar: ''
          },
          vendorInfo: {
            businessName: 'Bella Beauty Salon',
            avatar: ''
          }
        }
      }
    ];

    const createdChats = await Chat.create(chats);
    console.log('Sample chats created');

    // Create sample messages for the chats
    const messages = [
      // Messages for Pizza Palace chat
      {
        chat: createdChats[0]._id,
        sender: createdUsers[1]._id, // John Doe
        senderRole: 'customer',
        content: 'Hi! I\'d like to know more about your pizza specials for this week.',
        messageType: 'text'
      },
      {
        chat: createdChats[0]._id,
        sender: createdUsers[3]._id, // Mike Johnson (Pizza Palace vendor)
        senderRole: 'vendor',
        content: 'Hello! Thanks for your interest. This week we have a great deal on our Supreme Pizza - buy one large, get the second one 50% off!',
        messageType: 'text'
      },
      {
        chat: createdChats[0]._id,
        sender: createdUsers[1]._id, // John Doe
        senderRole: 'customer',
        content: 'That sounds great! What ingredients are on the Supreme Pizza?',
        messageType: 'text'
      },
      {
        chat: createdChats[0]._id,
        sender: createdUsers[3]._id, // Mike Johnson
        senderRole: 'vendor',
        content: 'The Supreme comes with pepperoni, Italian sausage, bell peppers, onions, mushrooms, and black olives. It\'s definitely our most popular!',
        messageType: 'text'
      },
      {
        chat: createdChats[0]._id,
        sender: createdUsers[1]._id, // John Doe
        senderRole: 'customer',
        content: 'Perfect! I\'ll place an order for two large Supreme pizzas. What\'s your estimated delivery time?',
        messageType: 'text'
      },

      // Messages for TechRepair Pro chat
      {
        chat: createdChats[1]._id,
        sender: createdUsers[2]._id, // Jane Smith
        senderRole: 'customer',
        content: 'Hi, my laptop screen is cracked and I need it repaired urgently. Do you provide same-day service?',
        messageType: 'text'
      },
      {
        chat: createdChats[1]._id,
        sender: createdUsers[4]._id, // Sarah Davis (TechRepair Pro vendor)
        senderRole: 'vendor',
        content: 'Hello Jane! Yes, we do offer same-day screen replacement for most laptop models. Could you tell me the make and model of your laptop?',
        messageType: 'text'
      },
      {
        chat: createdChats[1]._id,
        sender: createdUsers[2]._id, // Jane Smith
        senderRole: 'customer',
        content: 'It\'s a MacBook Pro 13-inch from 2021. The crack is pretty bad - goes across half the screen.',
        messageType: 'text'
      },
      {
        chat: createdChats[1]._id,
        sender: createdUsers[4]._id, // Sarah Davis
        senderRole: 'vendor',
        content: 'I have that screen in stock! The repair would be $299 and I can have it ready by 5 PM today if you bring it in before noon. Would that work for you?',
        messageType: 'text'
      },

      // Messages for Bella Beauty Salon chat
      {
        chat: createdChats[2]._id,
        sender: createdUsers[1]._id, // John Doe
        senderRole: 'customer',
        content: 'Hello! I\'d like to book a haircut appointment for this Saturday. Do you have any availability?',
        messageType: 'text'
      },
      {
        chat: createdChats[2]._id,
        sender: createdUsers[5]._id, // Emily Wilson (Bella Beauty Salon vendor)
        senderRole: 'vendor',
        content: 'Hi John! Yes, I have availability on Saturday. I have slots at 10 AM, 2 PM, and 4 PM. Which time works best for you?',
        messageType: 'text'
      },
      {
        chat: createdChats[2]._id,
        sender: createdUsers[1]._id, // John Doe
        senderRole: 'customer',
        content: 'The 2 PM slot would be perfect! How much do you charge for a men\'s haircut?',
        messageType: 'text'
      },
      {
        chat: createdChats[2]._id,
        sender: createdUsers[5]._id, // Emily Wilson
        senderRole: 'vendor',
        content: 'Great! I\'ll book you for 2 PM on Saturday. Men\'s haircuts are $35. Please let me know if you need to reschedule at least 2 hours in advance.',
        messageType: 'text'
      }
    ];

    const createdMessages = await Message.create(messages);
    console.log('Sample messages created');

    // Update chats with last messages and activity
    for (let i = 0; i < createdChats.length; i++) {
      const chatMessages = createdMessages.filter(msg => msg.chat.toString() === createdChats[i]._id.toString());
      if (chatMessages.length > 0) {
        const lastMessage = chatMessages[chatMessages.length - 1];
        await createdChats[i].updateLastMessage(lastMessage._id);
      }
    }

    // Add some likes and comments to posts
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
