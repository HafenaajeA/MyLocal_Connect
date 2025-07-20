# PNPM Usage Guide for MyLocal_Connect MERN Stack

This guide covers how to use pnpm effectively with your MERN stack application.

## 🚀 Quick Start Commands

### Development
```bash
# Start both client and server in development mode (recommended)
pnpm run dev

# Start only server in development mode
pnpm run server:dev

# Start only client in development mode  
pnpm run client:dev
```

### Production
```bash
# Build client for production
pnpm run client:build

# Start server in production mode
pnpm start
```

## 📦 Package Management

### Installing Dependencies
```bash
# Install all dependencies (root, server, client)
pnpm run install:all

# Install in specific workspace
cd client && pnpm add <package-name>
cd server && pnpm add <package-name>

# Install dev dependencies
cd client && pnpm add -D <package-name>
cd server && pnpm add -D <package-name>
```

### Adding New Packages
```bash
# Add to client (React app)
cd client && pnpm add axios react-router-dom

# Add to server (Express app)  
cd server && pnpm add express mongoose dotenv

# Add dev dependencies
cd client && pnpm add -D vite @vitejs/plugin-react
cd server && pnpm add -D nodemon jest
```

### Removing Packages
```bash
cd client && pnpm remove <package-name>
cd server && pnpm remove <package-name>
```

## 🗄️ Database Management

```bash
# Seed database with sample data
pnpm run seed
```

## 🔧 Workspace Management

### Checking Dependencies
```bash
# List all dependencies in root
pnpm list

# List dependencies in specific workspace
cd client && pnpm list
cd server && pnpm list

# Check outdated packages
pnpm outdated
```

### Updating Dependencies
```bash
# Update all dependencies
pnpm update

# Update specific package
pnpm update <package-name>

# Update to latest versions (be careful!)
pnpm update --latest
```

## 🏗️ Build and Testing

### Client Build
```bash
# Build React app for production
pnpm run client:build

# Preview production build
cd client && pnpm run preview
```

### Server Testing
```bash
# Run server tests (if configured)
cd server && pnpm test

# Run API tests
cd server && pnpm run test:api
```

## 🚨 Troubleshooting

### Server Issues
```bash
# Check what's running on port 5000
cd server && pnpm run status

# Stop existing server processes
cd server && pnpm run stop

# Restart server
cd server && pnpm run restart
```

### Clean Install
```bash
# Remove node_modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
rm pnpm-lock.yaml client/pnpm-lock.yaml server/pnpm-lock.yaml
pnpm run install:all
```

### Clear pnpm Cache
```bash
pnpm store prune
```

## 📊 Project Structure

```
MyLocal_Connect/
├── package.json          # Root workspace config
├── pnpm-lock.yaml        # Root lockfile
├── client/               # React frontend
│   ├── package.json      # Client dependencies
│   ├── pnpm-lock.yaml    # Client lockfile
│   └── src/              # React source code
└── server/               # Express backend
    ├── package.json      # Server dependencies  
    ├── pnpm-lock.yaml    # Server lockfile
    └── *.js              # Server source code
```

## 🔄 Common Workflows

### Starting Development
```bash
# 1. Install dependencies
pnpm run install:all

# 2. Start development servers
pnpm run dev
```

### Adding a New Feature
```bash
# 1. Install required packages
cd client && pnpm add <frontend-package>
cd server && pnpm add <backend-package>

# 2. Start development
pnpm run dev
```

### Preparing for Production
```bash
# 1. Build client
pnpm run client:build

# 2. Test production build
cd client && pnpm run preview

# 3. Start production server
pnpm start
```

## 🎯 Performance Benefits of pnpm

- **Faster installs**: Up to 2x faster than npm
- **Disk space efficient**: Shared dependencies via hard links
- **Strict dependency resolution**: Prevents phantom dependencies
- **Monorepo support**: Built-in workspace management

## 📝 Environment Variables

Make sure you have the required `.env` files:

### Client (.env)
```
VITE_SERVER_URL=http://localhost:5000
```

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mylocal_connect
JWT_SECRET=your_jwt_secret_here
```

## 🔧 VS Code Integration

Your workspace is configured with VS Code tasks. You can also:

1. Open Command Palette (Ctrl+Shift+P)
2. Type "Tasks: Run Task"
3. Select from available pnpm tasks

## 📚 Additional Resources

- [pnpm Documentation](https://pnpm.io/)
- [pnpm CLI Reference](https://pnpm.io/cli/add)
- [Workspace Management](https://pnpm.io/workspaces)
