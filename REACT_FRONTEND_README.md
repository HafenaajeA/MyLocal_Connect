# MyLocal Connect - React Frontend

A comprehensive React frontend for the MyLocal Connect MERN stack application, featuring business discovery, real-time chat, and community interaction.

## 🚀 Features

### 🏢 Business Management
- **Business Discovery**: Search and filter local businesses by category, location, and ratings
- **Business Profiles**: Detailed business pages with images, reviews, contact info, and hours
- **Business Registration**: Vendors can add and manage their business listings
- **Review System**: Customers can rate and review businesses
- **Favorites**: Save and manage favorite businesses

### 💬 Real-time Communication
- **Live Chat**: Real-time messaging between customers and vendors
- **Socket.IO Integration**: Instant message delivery and typing indicators
- **Chat History**: Persistent message storage and chat management

### 👥 Community Features
- **User Profiles**: Comprehensive user profile management
- **Posts**: Create and share community posts
- **Social Interactions**: Follow users, like posts, and engage with content

### 🛡️ Admin Features
- **Admin Dashboard**: Comprehensive platform management interface
- **User Management**: Manage user accounts and roles
- **Business Moderation**: Approve/reject business listings
- **Review Moderation**: Moderate inappropriate reviews

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Admin/           # Admin dashboard components
│   ├── Chat/            # Chat system components
│   ├── ErrorBoundary.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   └── PostCard.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx # Authentication state management
│   └── ChatContext.jsx # Chat state management
├── pages/               # Main page components
│   ├── AddEditBusiness.jsx    # Business creation/editing
│   ├── AdminDashboard.jsx     # Admin panel
│   ├── BusinessDetails.jsx    # Business detail view
│   ├── BusinessListings.jsx   # Business directory
│   ├── CreatePost.jsx         # Post creation
│   ├── Home.jsx              # Homepage with featured businesses
│   ├── Login.jsx             # User authentication
│   ├── PostDetails.jsx       # Post detail view
│   ├── Profile.jsx           # User profiles
│   └── Register.jsx          # User registration
├── services/            # API service layers
│   ├── authService.js   # Authentication API
│   ├── businessService.js    # Business operations API
│   └── postService.js   # Posts API
├── utils/               # Utility functions
├── App.jsx              # Main application component
└── main.jsx            # Application entry point
```

## 🔧 Technology Stack

- **React 19.1.0**: Latest React with modern features
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **Socket.IO Client**: Real-time communication
- **Lucide React**: Modern icon library
- **React Hot Toast**: Toast notifications
- **Vite**: Fast build tool and development server

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Backend server running on port 5000

### Installation
```bash
# Navigate to client directory
cd client

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
pnpm run build
```

## 🔐 Environment Variables

Create a `.env` file in the client directory:

```env
VITE_SERVER_URL=http://localhost:5000
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with multi-column layouts
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Single-column layouts with collapsible navigation

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design with consistent styling
- **Color Scheme**: Purple gradient primary theme with accessible colors
- **Typography**: Clear hierarchy with readable fonts
- **Cards & Components**: Consistent component design language

### User Experience
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Form Validation**: Real-time validation with helpful error messages
- **Search & Filters**: Intuitive search and filtering interfaces
- **Pagination**: Smooth pagination for large data sets

## 🏢 Business Features Detail

### Business Listings
- **Search**: Real-time search by business name and description
- **Filters**: Category, location, rating, and custom filters
- **Sorting**: Multiple sorting options (newest, rating, alphabetical)
- **Grid Layout**: Responsive card-based layout
- **Quick Info**: Business cards show key information at a glance

### Business Details
- **Image Gallery**: Multiple images with navigation
- **Comprehensive Info**: Description, contact details, hours, services
- **Review System**: Customer reviews with star ratings
- **Interactive Features**: Save favorites, share, start chat
- **Owner Actions**: Edit business (for owners/admins)

### Business Management
- **Multi-step Form**: Organized sections for different business aspects
- **Image Upload**: Multiple image upload with preview
- **Services Management**: Dynamic list of business services
- **Hours Configuration**: Set operating hours for each day
- **Validation**: Comprehensive form validation

## 💬 Chat System

### Features
- **Real-time Messaging**: Instant message delivery
- **Chat History**: Persistent message storage
- **User Status**: Online/offline indicators
- **Typing Indicators**: Show when users are typing
- **Chat Management**: Start new chats, manage existing conversations

### Implementation
- Socket.IO client integration
- React Context for chat state
- Real-time updates and notifications
- Message persistence

## 🛡️ Admin Dashboard

### Capabilities
- **User Management**: View, manage, and moderate users
- **Business Moderation**: Approve/reject business listings
- **Review Management**: Moderate reviews and handle reports
- **Analytics**: View platform statistics and metrics
- **Role Management**: Manage user roles and permissions

## 🔄 State Management

### React Context
- **AuthContext**: User authentication and authorization
- **ChatContext**: Chat state and real-time updates

### React Query
- **Server State**: Efficient server state management
- **Caching**: Intelligent caching for better performance
- **Background Updates**: Automatic data refetching
- **Error Handling**: Centralized error management

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading for route-based components
- **Image Optimization**: Responsive images with fallbacks
- **Caching**: React Query caching for API responses
- **Bundle Optimization**: Vite build optimizations
- **Lazy Loading**: Deferred loading for non-critical content

## 🧪 Development

### Available Scripts
```bash
pnpm run dev        # Start development server
pnpm run build      # Build for production
pnpm run preview    # Preview production build
pnpm run lint       # Run ESLint
```

### Development Guidelines
- **Component Structure**: Keep components focused and reusable
- **Styling**: Use CSS modules or styled-components
- **State Management**: Use appropriate state management patterns
- **Error Handling**: Implement comprehensive error boundaries
- **Testing**: Write unit tests for critical components

## 🔧 Deployment

### Production Build
```bash
pnpm run build
```

### Environment Setup
- Configure `VITE_SERVER_URL` for production API
- Ensure backend server is accessible
- Set up proper CORS configuration

## 📚 API Integration

The frontend integrates with the backend API through service layers:

### Business Service
- GET `/api/businesses` - List businesses
- GET `/api/businesses/:id` - Get business details
- POST `/api/businesses` - Create business
- PUT `/api/businesses/:id` - Update business
- DELETE `/api/businesses/:id` - Delete business

### Review Service
- GET `/api/reviews` - List reviews
- POST `/api/reviews` - Create review
- PUT `/api/reviews/:id` - Update review
- DELETE `/api/reviews/:id` - Delete review

### Auth Service
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the troubleshooting guide
- Create an issue on GitHub
- Contact the development team

---

Built with ❤️ using React and modern web technologies.
