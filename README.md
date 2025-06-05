# DFashion - Social E-commerce Platform

A comprehensive e-commerce platform with social media features, similar to Instagram but focused on fashion and shopping. Built with Angular frontend, Ionic mobile app, and Node.js backend.

## 🚀 Features

### Social Media Features
- **Instagram-like Stories**: 24-hour disappearing stories with product tags
- **Posts & Feed**: Share fashion posts with product integration
- **Social Interactions**: Like, comment, share, and follow users
- **Product Tagging**: Tag products in stories and posts with buy-now functionality

### E-commerce Features
- **Multi-vendor Support**: Platform for multiple fashion vendors
- **Product Catalog**: Comprehensive product management with categories
- **Shopping Cart & Checkout**: Complete e-commerce functionality
- **Order Management**: Track orders and manage inventory

### User Roles
- **Customers**: Browse, shop, and create social content
- **Vendors**: Sell products and create promotional content
- **Admin**: Platform management and vendor approval

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Socket.io** for real-time features
- **Cloudinary** for image storage

### Frontend
- **Angular 17** for web application
- **Angular Material** for UI components
- **Bootstrap** for responsive design
- **RxJS** for reactive programming

### Mobile App
- **Ionic** for cross-platform mobile development
- **Capacitor** for native functionality

## 📁 Project Structure

```
DFashion/
├── backend/                 # Node.js API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & validation
│   ├── data/               # Sample data
│   └── scripts/            # Database seeding scripts
├── frontend/               # Angular web application
├── mobile/                 # Ionic mobile application
└── demo/                   # HTML/CSS/JS demo
    ├── index.html          # Main social feed demo
    ├── admin.html          # Admin dashboard demo
    ├── styles.css          # Main demo styles
    ├── admin-styles.css    # Admin dashboard styles
    ├── script.js           # Main demo functionality
    └── admin-script.js     # Admin dashboard functionality
```

## 🎯 Demo Features

### Main Social Feed (`demo/index.html`)
- Instagram-like interface with stories and posts
- Interactive product tags with hover effects
- Like, comment, and share functionality
- Responsive design for mobile and desktop
- Real-time animations and interactions

### Admin Dashboard (`demo/admin.html`)
- Comprehensive analytics dashboard
- User and vendor management
- Product performance tracking
- Vendor approval system
- Interactive charts and statistics

### Role-Based Admin System (`backend/admin-login.html`)
- **10 Admin Roles** with specific permissions
- **Department-Specific Dashboards** (Sales, Marketing, Accounting, Support)
- **Secure Authentication** with JWT and account lockout
- **Real-time Analytics** and performance metrics
- **Permission-Based Access Control** for different user levels

## 🚀 Quick Start

### Prerequisites
- **Node.js (v16 or higher)** - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Angular CLI** - Install with `npm install -g @angular/cli`

### Step 1: Install Node.js
If Node.js is not installed:
1. Download from [nodejs.org](https://nodejs.org/)
2. Install the LTS version
3. Verify installation: `node --version` and `npm --version`

### Step 2: Backend Setup
```bash
cd backend
npm install
# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env   # Mac/Linux

# Update .env with your configuration
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
ng serve
```

### Step 4: Database Seeding (Optional)
```bash
cd backend
node scripts/seedDatabase.js
```

### Step 5: Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📱 Demo Access

### Live Demo
Open the demo files directly in your browser:

1. **Main Social Feed**: Open `demo/index.html`
2. **Admin Dashboard**: Open `demo/admin.html`

### Sample Accounts

#### Customer Accounts (Frontend)
- **Customer**: maya@example.com / password123
- **Vendor**: raj@example.com / password123
- **Admin**: admin@dfashion.com / admin123

#### Admin Dashboard Accounts (Backend)
- **Super Admin**: superadmin@dfashion.com / admin123
- **Sales Manager**: sales.manager@dfashion.com / sales123
- **Marketing Manager**: marketing.manager@dfashion.com / marketing123
- **Account Manager**: accounts.manager@dfashion.com / accounts123
- **Support Manager**: support.manager@dfashion.com / support123

## 🎨 Key UI Features

### Instagram-like Design
- Stories carousel with gradient borders
- Post feed with product tagging
- Interactive like/comment system
- Smooth animations and transitions

### Product Integration
- Clickable product tags on images
- Hover cards with product details
- Direct "Buy Now" functionality
- Price display with discounts

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interactions
- Progressive Web App features

## 🔧 Configuration

### Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dfashion
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Database Models
- **User**: Customer, vendor, and admin profiles
- **Product**: Fashion items with variants and pricing
- **Story**: 24-hour content with product tags
- **Post**: Permanent social content
- **Order**: E-commerce transactions

## 📊 Analytics & Insights

### User Analytics
- User growth tracking
- Engagement metrics
- Social interaction statistics

### Product Analytics
- Sales performance
- View and click tracking
- Conversion rates

### Vendor Analytics
- Revenue tracking
- Product performance
- Customer engagement

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, AWS, or DigitalOcean
- Configure MongoDB Atlas for database
- Set up Cloudinary for image storage

### Frontend Deployment
- Build with `ng build --prod`
- Deploy to Netlify, Vercel, or AWS S3
- Configure environment variables

### Mobile App Deployment
- Build with `ionic build`
- Deploy to App Store and Google Play

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Instagram for UI/UX inspiration
- Myntra for e-commerce features
- Angular and Ionic communities
- Open source contributors

---

**DFashion** - Where Fashion Meets Social Commerce 🛍️✨
