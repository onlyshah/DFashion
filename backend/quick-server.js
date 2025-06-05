const http = require('http');

console.log('Starting DFashion Backend...');

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
        const accounts = {
          'superadmin@dfashion.com': 'admin123',
          'sales.manager@dfashion.com': 'sales123',
          'marketing.manager@dfashion.com': 'marketing123',
          'accounts.manager@dfashion.com': 'accounts123',
          'support.manager@dfashion.com': 'support123'
        };

        if (accounts[email] === password) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            message: 'Login successful',
            data: {
              token: 'demo-token-' + Date.now(),
              user: {
                email: email,
                fullName: email.split('@')[0].replace('.', ' '),
                role: email.includes('super') ? 'super_admin' : email.split('.')[0] + '_manager'
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
  console.log('🚀 DFashion Backend Running!');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`💾 Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('🔐 Demo Accounts:');
  console.log('• superadmin@dfashion.com / admin123');
  console.log('• sales.manager@dfashion.com / sales123');
  console.log('• marketing.manager@dfashion.com / marketing123');
  console.log('• accounts.manager@dfashion.com / accounts123');
  console.log('• support.manager@dfashion.com / support123');
  console.log('========================================');
  console.log('✅ Server ready! Test at admin login page.');
});

server.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Server stopped by user');
  process.exit(0);
});

console.log('Server starting...');
