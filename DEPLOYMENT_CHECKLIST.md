# 🚀 MyLocal Connect - Deployment Checklist

## Pre-Deployment Setup

### ✅ MongoDB Atlas
- [ ] MongoDB Atlas account created
- [ ] Cluster created (free tier)
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string obtained
- [ ] Connection string tested locally

### ✅ GitHub Repository
- [ ] All code committed and pushed to GitHub
- [ ] Repository is public or accessible by Render
- [ ] README.md updated with deployment instructions

### ✅ Environment Variables Prepared
- [ ] Backend production environment variables ready
- [ ] Frontend production environment variables ready
- [ ] Strong JWT secret generated
- [ ] Strong session secret generated

## Deployment Steps

### 🖥️ Backend Deployment (Render)
1. [ ] Go to Render.com and sign up/login
2. [ ] Create new Web Service
3. [ ] Connect GitHub repository
4. [ ] Configure service settings:
   - Name: `mylocal-connect-backend`
   - Environment: `Node`
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
5. [ ] Set environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGODB_URI=<atlas-connection-string>`
   - `JWT_SECRET=<strong-secret>`
   - `SESSION_SECRET=<strong-secret>`
   - `CLIENT_URL=<frontend-url-placeholder>`
6. [ ] Deploy and wait for completion
7. [ ] Copy backend service URL

### 🌐 Frontend Deployment (Render)
1. [ ] Create new Static Site on Render
2. [ ] Connect same GitHub repository
3. [ ] Configure service settings:
   - Name: `mylocal-connect-frontend`
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`
4. [ ] Set environment variables:
   - `VITE_API_URL=<backend-url>/api`
   - `VITE_APP_NAME=MyLocal Connect`
   - `VITE_APP_VERSION=1.0.0`
5. [ ] Deploy and wait for completion
6. [ ] Copy frontend service URL

### 🔄 Final Configuration
1. [ ] Update backend `CLIENT_URL` with actual frontend URL
2. [ ] Redeploy backend with updated CLIENT_URL
3. [ ] Test the complete application

## Post-Deployment Testing

### 🧪 Essential Tests
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Database operations work (create, read, update, delete)
- [ ] API endpoints respond correctly
- [ ] Real-time features work (if applicable)

### 🔧 Troubleshooting Checklist
- [ ] Check Render service logs for errors
- [ ] Verify all environment variables are set correctly
- [ ] Ensure MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] Verify CORS configuration allows frontend domain
- [ ] Check that API URLs include '/api' suffix

## Environment Variables Reference

### Backend Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mylocal_connect?retryWrites=true&w=majority
JWT_SECRET=<generate-strong-secret>
CLIENT_URL=https://your-frontend-app.onrender.com
SESSION_SECRET=<generate-strong-secret>
```

### Frontend Environment Variables
```
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=MyLocal Connect
VITE_APP_VERSION=1.0.0
```

## Useful Commands

```bash
# Generate strong secrets (run locally)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test build locally
cd client && npm run build && npm run preview

# Check deployment guide
./deployment-guide.sh
```

## Support

If you encounter issues:
1. Check Render service logs
2. Verify MongoDB Atlas connection
3. Ensure all environment variables are correct
4. Test API endpoints manually
5. Check browser console for frontend errors

---

🎉 **Congratulations on deploying MyLocal Connect!**
