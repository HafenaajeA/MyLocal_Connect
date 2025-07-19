# MyLocal Connect - MERN Stack Application

A full-stack community platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows local communities to connect, share events, and support local businesses.

## Features

### Backend (Node.js/Express)
- **Authentication System**: JWT-based authentication with secure password hashing
- **User Management**: User registration, login, profile management
- **Post Management**: Create, read, update, delete posts with categories
- **Social Features**: Like posts, comment system, user following
- **API Security**: Rate limiting, CORS, input validation, helmet security
- **Database**: MongoDB with Mongoose ODM

### Frontend (React)
- **Modern React**: Functional components with hooks
- **Routing**: React Router for navigation
- **State Management**: Context API for authentication
- **Data Fetching**: React Query for server state management
- **Form Handling**: React Hook Form with validation
- **UI Components**: Custom responsive components
- **Notifications**: Toast notifications for user feedback

## Project Structure

```
MyLocal_Connect/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context providers
│   │   ├── services/          # API services
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js backend
│   ├── config/                # Database and configuration
│   ├── middleware/            # Custom middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # Express routes
│   ├── package.json
│   └── server.js              # Entry point
├── package.json               # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- pnpm (preferred) or npm

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd MyLocal_Connect

# Install all dependencies (root, server, and client)
pnpm run install:all
```

### 2. Environment Configuration

#### Server Environment Variables
Create `/server/.env` file based on `/server/.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mylocal_connect
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

#### Client Environment Variables
Create `/client/.env` file based on `/client/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MyLocal Connect
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongodb
# or
mongod
```

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in server/.env

### 4. Seed Database (Optional)
```bash
pnpm run seed
```

This creates sample users and posts for testing.

### 5. Run the Application

#### Development Mode (Both client and server)
```bash
pnpm run dev
```

This starts:
- Backend server on http://localhost:5000
- Frontend development server on http://localhost:5173

#### Production Mode
```bash
# Build client
pnpm run client:build

# Start server only
pnpm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow/:id` - Follow user
- `DELETE /api/users/unfollow/:id` - Unfollow user
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts` - Get all posts (with pagination/filters)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment to post

## Available Scripts

### Root Level
- `pnpm run dev` - Run both client and server in development mode
- `pnpm run install:all` - Install dependencies for all projects
- `pnpm run seed` - Seed database with sample data

### Server Scripts
- `pnpm run dev` - Start server with nodemon
- `pnpm start` - Start production server
- `pnpm run seed` - Seed database

### Client Scripts
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-rate-limit** - Rate limiting

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Development Guidelines

### Code Style
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add proper validation for all inputs

### Security Considerations
- All passwords are hashed using bcryptjs
- JWT tokens for authentication
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration
- Security headers with helmet

### Database Schema
- **User Model**: Authentication, profile info, social connections
- **Post Model**: Community posts with categories, likes, comments

## Deployment

### Backend Deployment (e.g., Heroku)
1. Set environment variables
2. Ensure MongoDB connection
3. Deploy with `git push heroku main`

### Frontend Deployment (e.g., Netlify/Vercel)
1. Build the project: `pnpm run build`
2. Deploy the `dist` folder
3. Set environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Happy coding! 🚀**
