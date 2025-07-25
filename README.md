# 🌟 MyLocal Connect - Community Platform

<div align="center">

![MyLocal Connect](https://img.shields.io/badge/MyLocal%20Connect-MERN%20Stack-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**🚀 [Live Application](https://mylocal-connect-frontend.onrender.com) | 🔧 [API Documentation](https://mylocal-connect-backend.onrender.com/api) | 📊 [Health Check](https://mylocal-connect-backend.onrender.com/api/health)**

</div>

A modern, full-stack community platform built with the MERN stack that connects local communities, enables business discovery, and facilitates social interactions. Perfect for neighborhoods, local communities, and small businesses to stay connected.

## 🎯 Live Application

### 🌐 **Main Application**
**URL**: https://mylocal-connect-frontend.onrender.com

**Features Available:**
- 👤 User Registration & Authentication
- 📝 Create & Browse Community Posts  
- 🏪 Local Business Directory
- 💬 Real-time Chat System
- 👥 User Profiles & Social Features
- 📱 Responsive Mobile Design

### 🔧 **API Backend**
**Base URL**: https://mylocal-connect-backend.onrender.com
**API Endpoints**: https://mylocal-connect-backend.onrender.com/api

> **📝 Note**: The backend runs on Render's free tier, which may sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds to wake up. Subsequent requests are fast.

### 🔍 **Quick Start Guide**
1. **Visit**: https://mylocal-connect-frontend.onrender.com
2. **Register**: Create your account
3. **Explore**: Browse posts and businesses
4. **Connect**: Start chatting with community members
5. **Contribute**: Add posts and business listings

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

## 🚀 **Deployment Information**

### 📋 **Deployment Status: ✅ LIVE**

| Service | Status | URL | Purpose |
|---------|--------|-----|---------|
| 🌐 **Frontend** | ✅ Live | [mylocal-connect-frontend.onrender.com](https://mylocal-connect-frontend.onrender.com) | Main Application |
| 🔧 **Backend** | ✅ Live | [mylocal-connect-backend.onrender.com](https://mylocal-connect-backend.onrender.com) | API Server |
| 🗄️ **Database** | ✅ Connected | MongoDB Atlas | Data Storage |

### 🔗 **Quick Access Links**

- **🏠 Application Home**: [https://mylocal-connect-frontend.onrender.com](https://mylocal-connect-frontend.onrender.com)
- **📡 API Health Check**: [https://mylocal-connect-backend.onrender.com/api/health](https://mylocal-connect-backend.onrender.com/api/health)
- **📚 API Base URL**: `https://mylocal-connect-backend.onrender.com/api`
- **💻 Source Code**: [GitHub Repository](https://github.com/HafenaajeA/MyLocal_Connect)

### 🌟 **How to Use the Application**

1. **🔗 Visit the App**: Go to [mylocal-connect-frontend.onrender.com](https://mylocal-connect-frontend.onrender.com)
2. **📝 Sign Up**: Create your account with email and password
3. **🔑 Log In**: Access your dashboard
4. **📖 Browse Posts**: Explore community posts and discussions
5. **✍️ Create Posts**: Share with your community
6. **🏪 Discover Businesses**: Browse local business directory
7. **➕ Add Business**: List your business (if you're a business owner)
8. **💬 Chat**: Connect with other community members
9. **👤 Profile**: Manage your profile and preferences

### 🔧 **For Developers**

**API Testing**: Use tools like Postman or curl to test endpoints:
```bash
# Test health endpoint
curl https://mylocal-connect-backend.onrender.com/api/health

# Test authentication (example)
curl -X POST https://mylocal-connect-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

### 📊 **System Status**

- **🟢 Frontend**: Deployed on Render (Static Site)
- **🟢 Backend**: Deployed on Render (Web Service)
- **🟢 Database**: MongoDB Atlas (Free Tier)
- **🔐 Security**: JWT Authentication, HTTPS, CORS Configured
- **📱 Responsive**: Works on desktop, tablet, and mobile devices

---

## 🛠️ **Local Development Setup**

> **Note**: The application is already deployed and live! This section is for developers who want to run the application locally.

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- pnpm (preferred) or npm

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/HafenaajeA/MyLocal_Connect.git
cd MyLocal_Connect

# Install all dependencies (root, server, and client)
pnpm run install:all
```

### 2. Environment Configuration

#### Server Environment Variables
Create `/server/.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mylocal_connect
JWT_SECRET=your_super_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

#### Client Environment Variables
Create `/client/.env` file:

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

### 5. Run the Application

#### Development Mode (Both client and server)
```bash
pnpm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:5173`

#### Production Mode
```bash
# Build client
pnpm run client:build

# Start server only
pnpm start
```

---

## 🎮 **Getting Started for Users**

### 🚀 **Ready to Use - No Setup Required!**

The application is fully deployed and ready to use. Simply visit the link below:

**👉 [START USING MYLOCAL CONNECT](https://mylocal-connect-frontend.onrender.com) 👈**

### 📱 **User Guide**

#### 1️⃣ **Account Creation**
- Click **"Sign Up"** on the homepage
- Enter your email, name, and secure password
- Verify your account and log in

#### 2️⃣ **Explore the Community**
- **📖 Browse Posts**: View community discussions and announcements
- **🏪 Business Directory**: Discover local businesses and services
- **👥 User Profiles**: See other community members

#### 3️⃣ **Participate & Share**
- **✍️ Create Posts**: Share news, events, or discussions
- **💬 Comments**: Engage with posts through comments and likes
- **🏢 Add Business**: List your business in the directory

#### 4️⃣ **Connect & Chat**
- **💬 Real-time Chat**: Message other community members
- **🔔 Notifications**: Stay updated with community activity

### 🔧 **Features Available**

| Feature | Description | How to Access |
|---------|-------------|---------------|
| 📝 **Posts** | Community discussions, events, announcements | Homepage → Browse or Create |
| 🏪 **Businesses** | Local business directory | Navigation → "Businesses" |
| 💬 **Chat** | Real-time messaging | Navigation → "Chat" |
| 👤 **Profile** | Personal profile management | Navigation → "Profile" |
| 🔍 **Search** | Find posts, businesses, users | Search bar in navigation |

### 📞 **User Support**

- **❓ Questions?** Check the FAQ section in the app
- **🐛 Found a bug?** Report it through the feedback form
- **💡 Feature request?** Submit suggestions in the community forum

### 🌟 **Pro Tips**

- **📱 Mobile Friendly**: Works great on phones and tablets
- **🔒 Secure**: Your data is protected with industry-standard security
- **⚡ Fast**: Optimized for quick loading and smooth experience
- **🆓 Free**: Completely free to use for all community members

---

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

### Prerequisites for Deployment
- GitHub repository (for connecting to Render)
- MongoDB Atlas account
- Render account

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new project and cluster (free tier available)

2. **Configure Database Access**
   - Create a database user with read/write permissions
   - Note the username and password

3. **Configure Network Access**
   - Add IP address `0.0.0.0/0` (allow access from anywhere)

4. **Get Connection String**
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Format: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority`

### 2. Backend Deployment (Render)

1. **Create Web Service on Render**
   - Go to [Render](https://render.com) and sign up
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Service**
   ```
   Name: mylocal-connect-backend
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   Auto-Deploy: Yes
   ```

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-strong-secret-key>
   CLIENT_URL=<your-frontend-render-url>
   SESSION_SECRET=<generate-a-strong-session-secret>
   ```

### 3. Frontend Deployment (Render)

1. **Create Static Site on Render**
   - Click "New" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Service**
   ```
   Name: mylocal-connect-frontend
   Build Command: cd client && npm install && npm run build
   Publish Directory: client/dist
   Auto-Deploy: Yes
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=<your-backend-render-url>/api
   VITE_APP_NAME=MyLocal Connect
   VITE_APP_VERSION=1.0.0
   ```

### 4. Post-Deployment Steps

1. **Update URLs**
   - Copy your backend service URL from Render
   - Update `VITE_API_URL` in frontend environment variables
   - Copy your frontend URL and update `CLIENT_URL` in backend environment variables

2. **Test Deployment**
   - Visit your frontend URL
   - Test user registration and login
   - Verify database connections

3. **Optional: Custom Domain**
   - Configure custom domain in Render dashboard
   - Update environment variables with new domain

### 5. Deployment Commands

```bash
# Run deployment guide
./deployment-guide.sh

# Build client for production (local testing)
cd client && npm run build

# Test production build locally
cd client && npm run preview
```

### Environment Variables Reference

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mylocal_connect?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_for_production
CLIENT_URL=https://your-app-name.onrender.com
SESSION_SECRET=your_production_session_secret_key
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-app-name.onrender.com/api
VITE_APP_NAME=MyLocal Connect
VITE_APP_VERSION=1.0.0
```

### Troubleshooting Deployment

- **Build fails**: Check that all dependencies are in package.json
- **Database connection fails**: Verify MongoDB Atlas connection string and network access
- **CORS errors**: Ensure CLIENT_URL matches your frontend domain exactly
- **API calls fail**: Verify VITE_API_URL includes '/api' suffix
- **Environment variables**: Check that all required variables are set in Render dashboard

---

## 🏆 **About This Project**

### 🎯 **Project Goals**
MyLocal Connect was built to strengthen local communities by providing a digital platform where neighbors can:
- Share information and stay connected
- Discover and support local businesses
- Organize community events and discussions
- Build stronger neighborhood relationships

### 🛠️ **Technical Achievements**
- **Full-Stack MERN Application** with modern architecture
- **Real-time Features** using WebSocket technology
- **Responsive Design** that works on all devices
- **Security Best Practices** with JWT authentication
- **Cloud Deployment** on professional hosting platforms
- **Database Integration** with MongoDB Atlas
- **API-First Design** for potential mobile app integration

### 📊 **Project Statistics**
- **Frontend**: React 19 with Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Render (Frontend + Backend) + MongoDB Atlas
- **Security**: JWT tokens, bcrypt hashing, CORS protection
- **Performance**: Optimized build, code splitting, lazy loading

### 🚀 **Future Enhancements**
- 📱 Mobile app (React Native)
- 🗓️ Event calendar integration
- 📧 Email notifications
- 🔔 Push notifications
- 🌍 Multi-language support
- 📊 Analytics dashboard for businesses

---

## 🤝 **Contributing**

We welcome contributions! If you'd like to improve MyLocal Connect:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📝 **Development Guidelines**
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **MongoDB Atlas** for reliable database hosting
- **Render** for seamless deployment platform
- **React Team** for the amazing frontend framework
- **Node.js Community** for the robust backend ecosystem
- **Open Source Community** for the incredible tools and libraries

---

## 📞 **Contact & Support**

### 🔗 **Quick Links**
- **🌐 Live App**: [mylocal-connect-frontend.onrender.com](https://mylocal-connect-frontend.onrender.com)
- **💻 Source Code**: [GitHub Repository](https://github.com/HafenaajeA/MyLocal_Connect)
- **📡 API Status**: [Health Check](https://mylocal-connect-backend.onrender.com/api/health)

### 👨‍💻 **Developer Contact**
- **GitHub**: [@HafenaajeA](https://github.com/HafenaajeA)
- **Project Repository**: [MyLocal_Connect](https://github.com/HafenaajeA/MyLocal_Connect)

### 🆘 **Need Help?**
- **🐛 Report Bugs**: Create an issue on GitHub
- **💡 Feature Requests**: Submit via GitHub Issues
- **❓ General Questions**: Check existing issues or create a new one

---

<div align="center">

### 🌟 **Thank you for using MyLocal Connect!** 🌟

**Built with ❤️ for local communities**

**🚀 [Get Started Now](https://mylocal-connect-frontend.onrender.com) 🚀**

</div>

---

**Happy connecting! 🎉**
