// Simple test server to verify Node.js is working
const http = require('http');

console.log('Starting DFashion Backend Server...');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url;
  
  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      message: 'DFashion Backend is running!',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (url === '/api/admin/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        // Demo admin accounts
        const adminAccounts = {
          'superadmin@dfashion.com': { password: 'admin123', role: 'super_admin', name: 'Super Admin' },
          'sales.manager@dfashion.com': { password: 'sales123', role: 'sales_manager', name: 'Sales Manager' },
          'marketing.manager@dfashion.com': { password: 'marketing123', role: 'marketing_manager', name: 'Marketing Manager' },
          'accounts.manager@dfashion.com': { password: 'accounts123', role: 'account_manager', name: 'Account Manager' },
          'support.manager@dfashion.com': { password: 'support123', role: 'support_manager', name: 'Support Manager' }
        };

        const account = adminAccounts[email];
        
        if (account && account.password === password) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            data: {
              token: 'demo-token-' + Date.now(),
              user: {
                email: email,
                fullName: account.name,
                role: account.role
              }
            }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid request'
        }));
      }
    });
    return;
  }

  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 DFashion Backend Server Running!');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`💾 Health Check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔐 Demo Admin Accounts:');
  console.log('• Super Admin: superadmin@dfashion.com / admin123');
  console.log('• Sales Manager: sales.manager@dfashion.com / sales123');
  console.log('• Marketing Manager: marketing.manager@dfashion.com / marketing123');
  console.log('• Account Manager: accounts.manager@dfashion.com / accounts123');
  console.log('• Support Manager: support.manager@dfashion.com / support123');
  console.log('========================================');
  console.log('✅ Server is ready! You can now test the admin login.');
  console.log('Press Ctrl+C to stop the server');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log('Port 5000 is already in use. Trying port 5001...');
    server.listen(5001);
  }
});

console.log('Server starting...');
