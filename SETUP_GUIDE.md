# 🚀 DFashion Angular App Setup Guide

## 📋 Prerequisites

### 1. Install Node.js
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the **LTS version** (recommended)
3. Run the installer with default settings
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Angular CLI
```bash
npm install -g @angular/cli
```

## 🎯 Quick Start

### Option 1: Automated Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

### Option 2: Step by Step
```bash
# 1. Install dependencies
npm install

# 2. Start the Angular development server
ng serve --host 0.0.0.0 --port 4200

# 3. Open browser to http://localhost:4200
```

## 🌐 Access the App

Once the server starts, you'll see:
```
✔ Browser application bundle generation complete.

Initial Chunk Files | Names         |  Raw Size
vendor.js           | vendor        |   2.50 MB | 
main.js             | main          | 500.00 kB | 
polyfills.js        | polyfills     | 300.00 kB | 
styles.css          | styles        | 200.00 kB | 

                    | Initial Total |   3.50 MB

Build at: 2024-01-15T10:30:00.000Z - Hash: abc123def456
** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **
```

**Open your browser to: http://localhost:4200**

## 🎨 What You'll See

### Instagram-like Social E-commerce Platform
- ✅ **Header** with DFashion logo and navigation
- ✅ **Stories carousel** with user avatars
- ✅ **Social feed** with posts and product tags
- ✅ **Sidebar** with trending products and suggestions
- ✅ **Real-time features** (when backend is running)

### Key Features
- 📱 **Instagram-like UI** with modern design
- 🛍️ **Product tagging** on social posts
- ❤️ **Like, comment, share** functionality
- 👥 **Follow/unfollow** users
- 🔥 **Trending products** sidebar
- 📊 **Real-time updates** (with backend)

## 🔧 Troubleshooting

### Common Issues

#### 1. Node.js Not Found
```bash
Error: 'node' is not recognized as an internal or external command
```
**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

#### 2. Angular CLI Not Found
```bash
Error: 'ng' is not recognized as an internal or external command
```
**Solution**: Install Angular CLI globally
```bash
npm install -g @angular/cli
```

#### 3. Port Already in Use
```bash
Error: Port 4200 is already in use
```
**Solution**: Use a different port
```bash
ng serve --port 4201
```

#### 4. Dependencies Issues
```bash
Error: Cannot resolve dependency
```
**Solution**: Clear cache and reinstall
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Backend Integration

### Start Backend Server (Optional)
```bash
# In a new terminal
cd ../backend
npm install
npm run dev
```

### With Backend Running
- ✅ **Real-time likes** and comments
- ✅ **Live notifications**
- ✅ **User authentication**
- ✅ **Database integration**
- ✅ **Socket.io real-time features**

### Without Backend
- ✅ **Mock data** for demonstration
- ✅ **UI interactions** work
- ✅ **Responsive design**
- ✅ **Component functionality**

## 📱 Mobile Testing

The Angular app is fully responsive:
```bash
# Start with network access for mobile testing
ng serve --host 0.0.0.0 --port 4200
```

Then access from mobile: `http://YOUR_IP:4200`

## 🎯 Development Commands

```bash
# Start development server
ng serve

# Build for production
ng build

# Run tests
ng test

# Generate component
ng generate component component-name

# Generate service
ng generate service service-name
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Services, models, guards
│   │   ├── shared/            # Shared components
│   │   ├── features/          # Feature modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── home/          # Main feed
│   │   │   ├── profile/       # User profiles
│   │   │   └── shop/          # Shopping
│   │   └── app.component.ts   # Root component
│   ├── assets/                # Static assets
│   └── styles.scss            # Global styles
├── angular.json               # Angular configuration
└── package.json               # Dependencies
```

## 🌟 Features Overview

### Home Page (`/home`)
- Stories carousel
- Social feed with posts
- Product tagging
- Sidebar with trending items

### Authentication (`/auth`)
- Login page
- Registration page
- Demo accounts available

### Profile (`/profile`)
- User profile pages
- Posts grid
- Follow/unfollow

### Shop (`/shop`)
- Product catalog
- Filters and search
- Product details

## 🎨 UI Components

### Stories Component
- Circular avatars with gradients
- Horizontal scroll
- Click to view stories

### Post Card Component
- User information
- Image with product tags
- Like, comment, share actions
- Real-time updates

### Sidebar Component
- Trending products
- Suggested users
- Live statistics

## 🔄 Real-time Features

When backend is running:
- Live like counters
- Real-time comments
- Follow notifications
- Socket.io integration

## 📞 Support

If you encounter any issues:
1. Check Node.js installation
2. Verify Angular CLI installation
3. Clear npm cache
4. Reinstall dependencies
5. Check console for errors

---

**Ready to experience the future of social e-commerce!** 🛍️✨
