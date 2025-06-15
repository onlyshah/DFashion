# 🧪 Cart API Testing Guide

## ✅ **Debugging Steps Added**

I've added comprehensive debugging to identify the 500 Internal Server Error:

### **1. ✅ Backend Debugging Added**
- **Cart Route**: Added detailed logging for user ID, cart creation, and population
- **Auth Middleware**: Added logging for token validation and user authentication
- **Role Middleware**: Added logging for role checking

### **2. ✅ Test Endpoints Added**
- **`GET /api/cart-new/test`**: Basic route test (no auth required)
- **`GET /api/cart-new/test-auth`**: Authentication test

---

## 🧪 **Manual Testing Steps**

### **Step 1: Test Basic Route**
```bash
# Test if cart routes are mounted and working
curl http://localhost:5000/api/cart-new/test

# Expected response:
{
  "success": true,
  "message": "Cart routes are working",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Step 2: Test Authentication**
```bash
# First, login to get a token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123"
  }'

# Copy the token from response, then test auth
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/cart-new/test-auth

# Expected response:
{
  "success": true,
  "message": "Cart auth is working",
  "user": "customer@example.com",
  "role": "customer",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Step 3: Test Cart Endpoint**
```bash
# Test the actual cart endpoint
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/cart-new

# Check backend console for debugging output
```

---

## 🔍 **What to Look For**

### **Backend Console Output:**
```
🔐 Auth middleware - Token present: true
🔐 Auth middleware - Token decoded, userId: 507f1f77bcf86cd799439011
🔐 Auth middleware - User found: true
🔐 Auth middleware - User authenticated: customer@example.com Role: customer
🔐 Role check - User role: customer Required roles: customer
🔐 Role check - Access granted
🛒 Getting cart for user: 507f1f77bcf86cd799439011
🛒 User object: { _id: ..., email: ..., role: ... }
🛒 Existing cart found: No
🛒 Creating new cart for user
🛒 New cart created: 507f1f77bcf86cd799439012
🛒 Cart populated successfully
🛒 Cart items count: 0
🛒 Summary generated successfully
```

### **Error Scenarios:**
```
❌ Auth middleware error: JsonWebTokenError: invalid token
❌ Get cart error: ValidationError: ...
❌ Populate error: CastError: ...
❌ Summary error: TypeError: ...
```

---

## 🔧 **Common Issues & Solutions**

### **Issue: JWT_SECRET Not Set**
```bash
# Check if JWT_SECRET is set in .env
cat backend/.env | grep JWT_SECRET

# If missing, add it:
echo "JWT_SECRET=your-secret-key-here" >> backend/.env
```

### **Issue: MongoDB Connection**
```bash
# Check MongoDB connection in backend console
# Should see: "✅ MongoDB connected successfully"
# If not, check MongoDB service is running
```

### **Issue: User Not Found**
```bash
# Check if test user exists
# Login should work first before testing cart
```

### **Issue: Cart Model Error**
```bash
# Check if Cart model is properly defined
# Look for validation errors in console
```

---

## 🎯 **Frontend Testing**

### **Browser Console Test:**
```javascript
// Test API endpoints directly from browser console
fetch('http://localhost:5000/api/cart-new/test')
  .then(r => r.json())
  .then(console.log);

// Test with auth token
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/cart-new/test-auth', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log);

// Test cart endpoint
fetch('http://localhost:5000/api/cart-new', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

---

## 🚀 **Next Steps**

1. **Start Backend Server** - Ensure Node.js is properly installed
2. **Check Console Output** - Look for debugging messages
3. **Test Basic Endpoints** - Verify routes are working
4. **Test Authentication** - Ensure auth middleware works
5. **Test Cart Creation** - Identify exact error location

### **If Backend Won't Start:**
```bash
# Check Node.js installation
node --version
npm --version

# If not installed, install Node.js first
# Then try starting the server again
```

### **If 500 Errors Persist:**
1. Check backend console for detailed error messages
2. Verify MongoDB is running and connected
3. Check if all required environment variables are set
4. Verify Cart model schema is correct

The debugging output will help identify exactly where the 500 error is occurring! 🔍
