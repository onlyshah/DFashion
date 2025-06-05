// DFashion Standalone Admin Server (No external dependencies required)
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting DFashion Admin Server...');

// Mock admin users database
const adminUsers = [
  {
    id: '1',
    email: 'superadmin@dfashion.com',
    password: 'admin123',
    fullName: 'Super Admin',
    role: 'super_admin',
    department: 'administration',
    employeeId: 'EMP001',
    isActive: true,
    permissions: ['all']
  },
  {
    id: '2',
    email: 'sales.manager@dfashion.com',
    password: 'sales123',
    fullName: 'Sales Manager',
    role: 'sales_manager',
    department: 'sales',
    employeeId: 'EMP002',
    isActive: true,
    permissions: ['dashboard.view', 'orders.*', 'users.view']
  },
  {
    id: '3',
    email: 'marketing.manager@dfashion.com',
    password: 'marketing123',
    fullName: 'Marketing Manager',
    role: 'marketing_manager',
    department: 'marketing',
    employeeId: 'EMP003',
    isActive: true,
    permissions: ['dashboard.view', 'marketing.*', 'products.view']
  },
  {
    id: '4',
    email: 'accounts.manager@dfashion.com',
    password: 'accounts123',
    fullName: 'Account Manager',
    role: 'account_manager',
    department: 'accounting',
    employeeId: 'EMP004',
    isActive: true,
    permissions: ['dashboard.view', 'finance.*', 'orders.view']
  },
  {
    id: '5',
    email: 'support.manager@dfashion.com',
    password: 'support123',
    fullName: 'Support Manager',
    role: 'support_manager',
    department: 'support',
    employeeId: 'EMP005',
    isActive: true,
    permissions: ['dashboard.view', 'support.*', 'users.view']
  }
];

// Mock data for dashboard
const mockData = {
  dashboard: {
    overview: {
      users: { total: 1250, vendors: 45, new_today: 12, new_this_month: 340 },
      products: { total: 890, active: 756, pending: 23, new_today: 8 },
      orders: { total: 2340, today: 45, this_month: 890 },
      revenue: { total: 2450000, today: 125000, this_month: 1850000 }
    },
    departments: {
      sales: {
        team_size: 8,
        active_leads: 156,
        conversions_today: 12,
        target_achievement: 85.5,
        team_performance: [
          { name: 'Raj Kumar', sales: 15, target: 20, achievement: 75 },
          { name: 'Priya Singh', sales: 22, target: 25, achievement: 88 },
          { name: 'Amit Sharma', sales: 18, target: 20, achievement: 90 }
        ]
      },
      marketing: {
        team_size: 5,
        campaigns_active: 7,
        reach_today: 25000,
        engagement_rate: 4.2,
        campaign_performance: [
          { name: 'Summer Collection', reach: 15000, engagement: 5.2, conversions: 45 },
          { name: 'Festive Offers', reach: 12000, engagement: 4.8, conversions: 38 }
        ]
      },
      support: {
        team_size: 6,
        tickets_open: 23,
        tickets_resolved_today: 18,
        avg_resolution_time: 3.2,
        satisfaction_rate: 94.5,
        agent_performance: [
          { name: 'Sneha Patel', tickets_resolved: 12, avg_time: 2.8, rating: 4.8 },
          { name: 'Rohit Gupta', tickets_resolved: 15, avg_time: 3.1, rating: 4.6 }
        ]
      },
      accounting: {
        team_size: 3,
        pending_invoices: 45,
        processed_today: 67,
        outstanding_amount: 450000,
        collection_rate: 92.5,
        financial_summary: {
          revenue_this_month: 1850000,
          expenses_this_month: 1200000,
          profit_margin: 35.1,
          tax_liability: 185000
        }
      }
    },
    recent_activities: [
      { type: 'user_registration', message: 'New customer registered: Priya Sharma', timestamp: new Date(), user: 'System' },
      { type: 'product_approval', message: 'Product approved: Summer Collection Dress', timestamp: new Date(), user: 'Admin' },
      { type: 'order_placed', message: 'High-value order placed: ₹25,000', timestamp: new Date(), user: 'System' }
    ]
  }
};

// Helper functions
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function serveStaticFile(res, filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon'
    };
    
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve static files
  if (pathname === '/' || pathname === '/admin-login.html') {
    serveStaticFile(res, path.join(__dirname, 'public', 'admin-login.html'));
    return;
  }

  if (pathname.startsWith('/admin') && pathname.endsWith('.html')) {
    const fileName = pathname.split('/').pop();
    serveStaticFile(res, path.join(__dirname, 'public', fileName));
    return;
  }

  // API Routes
  if (pathname === '/api/health') {
    sendJSON(res, {
      status: 'OK',
      message: 'DFashion Admin Backend is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: ['Admin Dashboard', 'Role-Based Access', 'Department Management']
    });
    return;
  }

  // Admin Authentication
  if (pathname === '/api/admin/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        const user = adminUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          const token = 'demo-token-' + user.id + '-' + Date.now();
          sendJSON(res, {
            success: true,
            message: 'Login successful',
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                department: user.department,
                employeeId: user.employeeId,
                permissions: user.permissions
              },
              expiresIn: '8h'
            }
          });
        } else {
          sendJSON(res, {
            success: false,
            message: 'Invalid credentials. Please check your email and password.',
            code: 'INVALID_CREDENTIALS'
          }, 401);
        }
      } catch (error) {
        sendJSON(res, {
          success: false,
          message: 'Invalid request body'
        }, 400);
      }
    });
    return;
  }

  // Dashboard Stats
  if (pathname === '/api/admin/dashboard/stats') {
    sendJSON(res, {
      success: true,
      data: mockData.dashboard
    });
    return;
  }

  // Department-specific dashboards
  if (pathname.startsWith('/api/admin/departments/')) {
    const department = pathname.split('/')[4];
    
    if (mockData.dashboard.departments[department]) {
      sendJSON(res, {
        success: true,
        data: {
          department: department.charAt(0).toUpperCase() + department.slice(1),
          metrics: mockData.dashboard.departments[department]
        }
      });
    } else {
      sendJSON(res, {
        success: false,
        message: 'Department not found'
      }, 404);
    }
    return;
  }

  // Analytics endpoint
  if (pathname === '/api/admin/analytics') {
    sendJSON(res, {
      success: true,
      data: {
        period: '7d',
        analytics: {
          sales: {
            revenue: [120000, 135000, 128000, 142000, 155000, 148000, 162000],
            orders: [45, 52, 48, 58, 62, 55, 68],
            conversion_rate: [2.4, 2.8, 2.6, 3.1, 3.3, 2.9, 3.5]
          },
          marketing: {
            reach: [15000, 18000, 16500, 22000, 25000, 21000, 28000],
            engagement: [4.2, 4.8, 4.5, 5.1, 5.3, 4.9, 5.6],
            cost_per_acquisition: [450, 420, 435, 380, 365, 395, 340]
          }
        }
      }
    });
    return;
  }

  // Default 404
  sendJSON(res, { 
    success: false,
    message: 'Endpoint not found',
    available_endpoints: [
      'GET /api/health',
      'POST /api/admin/auth/login',
      'GET /api/admin/dashboard/stats',
      'GET /api/admin/departments/{department}/dashboard',
      'GET /api/admin/analytics'
    ]
  }, 404);
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 DFashion Admin Backend Running!');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🛡️ Admin Login: http://localhost:${PORT}/admin-login.html`);
  console.log(`💾 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔐 Demo Admin Accounts:');
  adminUsers.forEach(user => {
    console.log(`• ${user.fullName}: ${user.email} / ${user.password}`);
  });
  console.log('');
  console.log('✅ Features Available:');
  console.log('• Role-Based Admin Dashboard');
  console.log('• Department-Specific Access Control');
  console.log('• Secure Authentication System');
  console.log('• Real-time API Endpoints');
  console.log('• Mock Data for Development');
  console.log('========================================');
  console.log('✅ Server is ready! Access the admin dashboard now.');
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  }
});

module.exports = server;
