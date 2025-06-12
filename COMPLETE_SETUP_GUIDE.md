# 🎯 DFashion Complete E-commerce Platform Setup Guide

## 📋 **Overview**
Complete full-stack e-commerce platform with social media features, admin dashboard, and comprehensive user management.

## 🚀 **Features Implemented**

### ✅ **Backend API (Node.js + MongoDB)**
- **Complete Authentication System**
  - User registration/login
  - Admin authentication with role-based access
  - JWT token management
  - Password encryption with bcrypt

- **User Management**
  - Multi-role system (Admin, Sales, Marketing, Customer, Vendor)
  - Permission-based access control
  - User blocking/unblocking
  - Profile management

- **Product Management**
  - CRUD operations for products
  - Product approval workflow
  - Featured products
  - Product reviews and ratings
  - Inventory management

- **Admin Dashboard**
  - Real-time statistics
  - User analytics
  - Product analytics
  - Revenue tracking

- **Database Management**
  - User registration and authentication
  - Product management
  - Order processing
  - Category management

### ✅ **Frontend Dashboard (Angular)**
- **Admin Panel** with Material Design
- **User Management Interface**
- **Product Management Interface**
- **Dashboard Analytics**
- **Role-based Navigation**

## 🛠️ **Prerequisites**

### **1. Install Node.js**
```bash
# Download from https://nodejs.org/
# Install LTS version (18.x or higher)
# Verify installation:
node --version
npm --version
```

### **2. Install MongoDB**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and start MongoDB service
# Verify installation:
mongosh --version
```

### **3. Install Angular CLI**
```bash
npm install -g @angular/cli
ng version
```

## 🔧 **Installation Steps**

### **Step 1: Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start the backend server
npm start
```

### **Step 2: Frontend Setup**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Angular Material
ng add @angular/material

# Start the frontend server
ng serve
```

## 🔐 **Account Creation**

### **Admin Accounts**
Create admin accounts using the registration endpoint:
- Use `/api/auth/register` with role: 'admin'
- Set appropriate permissions and department

### **Customer Accounts**
- **John Doe**: `john@example.com` / `password123`
- **Jane Doe**: `jane@example.com` / `password123`

### **Vendor Account**
- **Fashion Vendor**: `vendor@fashion.com` / `vendor123`

## 🌐 **Access URLs**

### **Backend API**
- **Server**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/docs

### **Frontend Applications**
- **Main App**: http://localhost:4200
- **Admin Dashboard**: http://localhost:4200/admin

## 📡 **API Endpoints**

### **Authentication**
```
POST /api/auth/register          - User registration
POST /api/auth/login             - User login
POST /api/auth/admin/login       - Admin login
GET  /api/auth/me                - Get current user
GET  /api/auth/verify            - Verify token
PUT  /api/auth/change-password   - Change password
```

### **User Management**
```
GET    /api/users                - Get all users (Admin)
GET    /api/users/:id            - Get user by ID
POST   /api/users                - Create user (Admin)
PUT    /api/users/:id            - Update user
DELETE /api/users/:id            - Delete user (Admin)
PUT    /api/users/:id/block      - Block/Unblock user (Admin)
PUT    /api/users/:id/permissions - Update permissions (Super Admin)
GET    /api/users/stats          - User statistics (Admin)
```

### **Product Management**
```
GET    /api/products             - Get all products
GET    /api/products/:id         - Get product by ID
POST   /api/products             - Create product (Vendor/Admin)
PUT    /api/products/:id         - Update product (Vendor/Admin)
DELETE /api/products/:id         - Delete product (Vendor/Admin)
PUT    /api/products/:id/approve - Approve product (Admin)
PUT    /api/products/:id/featured - Toggle featured (Admin)
POST   /api/products/:id/reviews - Add review
GET    /api/products/stats       - Product statistics (Admin)
```

### **Admin Dashboard**
```
GET /api/admin/dashboard         - Dashboard statistics
```

## 🎯 **User Roles & Permissions**

### **Super Admin (admin)**
- Full system access
- User management (create, edit, delete, block)
- Permission management
- Product approval
- System settings

### **Sales Manager (sales)**
- Product management
- Order management
- Customer support
- Sales analytics

### **Marketing Manager (marketing)**
- Content management (posts, stories)
- Product promotion
- Marketing analytics
- Campaign management

### **Customer (customer)**
- Product browsing
- Order placement
- Profile management
- Reviews and ratings

### **Vendor (vendor)**
- Product creation and management
- Order fulfillment
- Inventory management
- Sales tracking

## 🗄️ **Database Schema**

### **User Model**
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  fullName: String,
  role: String,
  department: String,
  employeeId: String,
  permissions: Array,
  isActive: Boolean,
  isVerified: Boolean,
  avatar: String,
  lastLogin: Date
}
```

### **Product Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  discountPrice: Number,
  category: String,
  subcategory: String,
  brand: String,
  images: Array,
  colors: Array,
  sizes: Array,
  tags: Array,
  inventory: Object,
  vendor: ObjectId,
  isActive: Boolean,
  isApproved: Boolean,
  isFeatured: Boolean,
  reviews: Array,
  rating: Object,
  analytics: Object
}
```

## 🚀 **Running the Application**

### **Development Mode**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
ng serve

# Terminal 3: MongoDB (if not running as service)
mongod
```

### **Production Mode**
```bash
# Backend
cd backend
npm start

# Frontend (build and serve)
cd frontend
ng build --prod
# Serve dist folder with your web server
```

## 🔧 **Environment Variables**

### **Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/dfashion
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 📱 **Features by User Type**

### **End Users (Customers)**
- ✅ User registration and login
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ Order placement and tracking
- ✅ User dashboard
- ✅ Profile management
- ✅ Product reviews
- 🔄 Stories and posts (coming soon)
- 🔄 Social features (coming soon)

### **Vendors**
- ✅ Vendor registration
- ✅ Product management
- ✅ Inventory tracking
- ✅ Order fulfillment
- 🔄 Vendor dashboard (coming soon)
- 🔄 Sales analytics (coming soon)

### **Admins**
- ✅ Complete user management
- ✅ Product approval workflow
- ✅ Role and permission management
- ✅ Dashboard analytics
- ✅ System monitoring
- ✅ Content moderation

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Node.js not found**
   - Install Node.js from official website
   - Add to system PATH
   - Restart terminal

2. **MongoDB connection error**
   - Start MongoDB service
   - Check connection string in .env
   - Verify MongoDB is running on port 27017

3. **Port already in use**
   - Change PORT in .env file
   - Kill existing processes on port 5000/4200

4. **Dependencies not installed**
   - Run `npm install` in both backend and frontend
   - Clear node_modules and reinstall if needed

## 📞 **Support**

For issues or questions:
1. Check the logs in terminal
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check API endpoints with Postman/curl

---

**🎉 Your DFashion E-commerce Platform is ready to use!**

The system includes:
- ✅ Complete backend API with authentication
- ✅ Database seeding with sample data
- ✅ Admin dashboard for management
- ✅ Role-based access control
- ✅ Product and user management
- ✅ Real-time analytics
- ✅ Scalable architecture
