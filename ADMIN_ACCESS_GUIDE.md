# 🔑 Admin Dashboard Access Guide

## **Quick Access (After Seeding)**

### **Step 1: Login as Admin**
1. **Start your development server**: `pnpm run dev`
2. **Open your browser**: http://localhost:5173
3. **Go to Login page**: Click "Login" in the navigation
4. **Use admin credentials**:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`

### **Step 2: Access Admin Dashboard**
After logging in with admin credentials:
1. **Look for "Admin" link** in the navigation bar (desktop) or mobile menu
2. **Click "Admin"** to go to `/admin-dashboard`
3. **You'll see the admin dashboard** with tabs for:
   - 📊 **Dashboard**: Statistics and overview
   - 👥 **Users**: Manage all users
   - 🏢 **Businesses**: Moderate businesses
   - ⭐ **Reviews**: Moderate reviews

---

## **🛠️ Setup Process (If Admin Doesn't Exist)**

### **1. Seed the Database**
```bash
# Make sure your server is running first
pnpm run dev

# Then in another terminal, seed the database
cd server && pnpm run seed
```

### **2. Manual Admin Creation (Alternative)**
If you need to create an admin manually, you can do it via MongoDB or create a script:

#### **Option A: Using MongoDB Compass/CLI**
```javascript
// Connect to your MongoDB database
// Update any existing user to admin role
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

#### **Option B: Create Admin Script**
Create `/server/scripts/createAdmin.js`:
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mylocal_connect');
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      bio: 'System administrator',
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
```

Then run: `node scripts/createAdmin.js`

---

## **🔐 Admin Dashboard Features**

### **Dashboard Tab (📊)**
- **User Statistics**: Total users, new users this month
- **Business Statistics**: Total businesses, new businesses
- **Review Statistics**: Total reviews, flagged reviews
- **System Health**: Active chats, server status

### **Users Tab (👥)**
- **View all users** with pagination
- **User details**: Name, email, role, join date
- **Role management**: Change user roles
- **Account actions**: Suspend/activate users

### **Businesses Tab (🏢)**
- **Moderate business listings**
- **Approve/reject** new businesses
- **Edit business information**
- **Delete inappropriate businesses**

### **Reviews Tab (⭐)**
- **Review moderation**
- **Flag/unflag reviews**
- **Delete inappropriate reviews**
- **View review details and context**

---

## **🚨 Troubleshooting**

### **Problem: "Access Denied" Message**
**Solution**: Make sure you're logged in with an admin account
```bash
# Check your user role in browser console
console.log(JSON.parse(localStorage.getItem('user')));
```

### **Problem: Admin Link Not Visible**
**Cause**: You're not logged in as admin
**Solution**: 
1. Logout if logged in as regular user
2. Login with admin credentials
3. Admin link will appear in navigation

### **Problem: "Cannot access admin dashboard"**
**Solutions**:
1. **Clear browser storage**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
2. **Re-login with admin account**
3. **Check server console** for auth errors

### **Problem: Admin User Doesn't Exist**
**Solutions**:
1. **Run seed script**: `cd server && pnpm run seed`
2. **Check database**: Verify admin user exists
3. **Create manually**: Use the script above

---

## **🔄 Admin Workflow**

### **Daily Admin Tasks**
1. **Check Dashboard**: Review daily statistics
2. **Moderate Reviews**: Check flagged reviews
3. **Approve Businesses**: Review new business applications
4. **User Management**: Handle user reports/issues

### **Security Best Practices**
1. **Change default password** after first login
2. **Use strong passwords** for admin accounts
3. **Limit admin access** to trusted users only
4. **Monitor admin actions** through logs

---

## **📝 Current Admin Credentials**

After running the seed script:
- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `admin`

**⚠️ Important**: Change the default password in production!

---

## **🔗 Quick Links**

- **Login**: http://localhost:5173/login
- **Admin Dashboard**: http://localhost:5173/admin-dashboard
- **API Health Check**: http://localhost:5000/api/health
- **Database**: Connect to MongoDB at `mongodb://localhost:27017/mylocal_connect`

---

## **📚 Related Files**

- **Admin Routes**: `/server/routes/admin.js`
- **Role Middleware**: `/server/middleware/roleMiddleware.js`
- **Admin Dashboard**: `/client/src/pages/AdminDashboard.jsx`
- **Admin Components**: `/client/src/components/Admin/`
- **Seed Data**: `/server/config/seed.js`
