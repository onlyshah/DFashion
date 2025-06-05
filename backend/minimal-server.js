// Minimal DFashion Backend Server (No external dependencies)
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Mock admin users
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
    lastLogin: new Date()
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
    lastLogin: new Date()
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
    lastLogin: new Date()
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
    lastLogin: new Date()
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
    lastLogin: new Date()
  }
];

// Helper functions
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
}

// Create server
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
    serveFile(res, path.join(__dirname, 'public', 'admin-login.html'), 'text/html');
    return;
  }

  if (pathname.startsWith('/admin') && pathname.endsWith('.html')) {
    const fileName = pathname.split('/').pop();
    serveFile(res, path.join(__dirname, 'public', fileName), 'text/html');
    return;
  }

  // API Routes
  if (pathname === '/api/health') {
    sendJSON(res, {
      status: 'OK',
      message: 'DFashion Backend is running!',
      timestamp: new Date().toISOString(),
      features: ['Admin Dashboard', 'Role-Based Access', 'JWT Authentication']
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
                employeeId: user.employeeId
              },
              permissions: getUserPermissions(user.role),
              expiresIn: '8h'
            }
          });
        } else {
          sendJSON(res, {
            success: false,
            message: 'Invalid credentials',
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
      data: {
        overview: {
          users: { total: 1250, vendors: 45, new_today: 12, new_this_month: 340 },
          products: { total: 890, active: 756, pending: 23, new_today: 8 },
          orders: { total: 2340, today: 45, this_month: 890 },
          revenue: { total: 2450000, today: 125000, this_month: 1850000 }
        },
        departments: {
          sales: { team_size: 8, active_leads: 156, conversions_today: 12, target_achievement: 85.5 },
          marketing: { team_size: 5, campaigns_active: 7, reach_today: 25000, engagement_rate: 4.2 },
          support: { team_size: 6, tickets_open: 23, tickets_resolved_today: 18, satisfaction_rate: 94.5 },
          accounting: { team_size: 3, pending_invoices: 45, processed_today: 67, outstanding_amount: 450000 }
        },
        recent_activities: [
          { type: 'user_registration', message: 'New customer registered: Priya Sharma', timestamp: new Date(), user: 'System' },
          { type: 'product_approval', message: 'Product approved: Summer Collection Dress', timestamp: new Date(), user: 'Admin' },
          { type: 'order_placed', message: 'High-value order placed: ₹25,000', timestamp: new Date(), user: 'System' }
        ]
      }
    });
    return;
  }

  // Department Dashboards
  if (pathname.startsWith('/api/admin/departments/')) {
    const department = pathname.split('/')[4];
    
    const departmentData = {
      sales: {
        department: 'Sales',
        metrics: { leads_today: 45, conversions: 12, revenue_today: 125000, target_achievement: 85.5 }
      },
      marketing: {
        department: 'Marketing',
        metrics: { campaigns_active: 7, reach_today: 25000, engagement_rate: 4.2, cost_per_acquisition: 340 }
      },
      support: {
        department: 'Support',
        metrics: { tickets_open: 23, tickets_resolved_today: 18, avg_resolution_time: 3.2, satisfaction_rate: 94.5 }
      },
      accounting: {
        department: 'Accounting',
        metrics: { pending_invoices: 45, processed_today: 67, outstanding_amount: 450000, collection_rate: 92.5 }
      }
    };

    sendJSON(res, {
      success: true,
      data: departmentData[department] || { error: 'Department not found' }
    });
    return;
  }

  // Default 404
  sendJSON(res, { error: 'Not found' }, 404);
});

// Helper function to get user permissions
function getUserPermissions(role) {
  const permissions = {
    super_admin: ['all'],
    admin: ['dashboard.*', 'users.*', 'products.*', 'orders.*', 'settings.*'],
    sales_manager: ['dashboard.view', 'dashboard.analytics', 'orders.*', 'users.view'],
    sales_executive: ['dashboard.view', 'orders.view', 'orders.edit'],
    marketing_manager: ['dashboard.view', 'dashboard.analytics', 'marketing.*', 'products.view'],
    marketing_executive: ['dashboard.view', 'marketing.campaigns', 'marketing.content'],
    account_manager: ['dashboard.view', 'dashboard.analytics', 'finance.*', 'orders.view'],
    accountant: ['dashboard.view', 'finance.view', 'finance.reports'],
    support_manager: ['dashboard.view', 'support.*', 'users.view'],
    support_agent: ['dashboard.view', 'support.tickets', 'support.chat']
  };

  return permissions[role] || ['dashboard.view'];
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 DFashion Backend Server Running!');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🛡️ Admin Login: http://localhost:${PORT}/admin-login.html`);
  console.log(`💾 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔐 Demo Admin Accounts:');
  console.log('• Super Admin: superadmin@dfashion.com / admin123');
  console.log('• Sales Manager: sales.manager@dfashion.com / sales123');
  console.log('• Marketing Manager: marketing.manager@dfashion.com / marketing123');
  console.log('• Account Manager: accounts.manager@dfashion.com / accounts123');
  console.log('• Support Manager: support.manager@dfashion.com / support123');
  console.log('');
  console.log('✅ Features Available:');
  console.log('• Role-Based Admin Dashboard');
  console.log('• Department-Specific Access');
  console.log('• Secure Authentication');
  console.log('• Real-time API Endpoints');
  console.log('========================================');
  console.log('Press Ctrl+C to stop the server');
});

module.exports = server;
