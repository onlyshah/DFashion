// Simple DFashion Backend Server (No dependencies required)
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Mock data
const users = [
  {
    id: '1',
    username: 'fashionista_maya',
    fullName: 'Maya Sharma',
    email: 'maya@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    role: 'customer',
    followers: ['2', '3'],
    following: ['2', '4'],
    socialStats: { postsCount: 12, followersCount: 1250, followingCount: 890 }
  },
  {
    id: '2',
    username: 'style_guru_raj',
    fullName: 'Raj Patel',
    email: 'raj@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'vendor',
    followers: ['1'],
    following: ['3', '4'],
    socialStats: { postsCount: 45, followersCount: 5600, followingCount: 234 }
  }
];

const products = [
  {
    id: 'p1',
    name: 'Floral Maxi Dress',
    price: 2499,
    originalPrice: 3499,
    discount: 29,
    category: 'women',
    brand: 'StyleCraft',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
    vendorId: '2',
    views: 1250,
    likes: 89,
    purchases: 45
  },
  {
    id: 'p2',
    name: 'Classic White Shirt',
    price: 1899,
    originalPrice: 2299,
    discount: 17,
    category: 'men',
    brand: 'StyleCraft',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
    vendorId: '2',
    views: 2100,
    likes: 156,
    purchases: 78
  }
];

const posts = [
  {
    id: 'post1',
    userId: '1',
    caption: 'Loving this new floral dress! Perfect for the summer vibes 🌸 #SummerFashion #FloralDress #OOTD',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    productTags: [{ productId: 'p1', x: 40, y: 50 }],
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'post2',
    userId: '2',
    caption: 'Perfect formal shirt for office meetings! Quality fabric and great fit 👔 #FormalWear #OfficeStyle',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    productTags: [{ productId: 'p2', x: 50, y: 50 }],
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
];

const stories = [
  {
    id: 'story1',
    userId: '1',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
    caption: 'Perfect outfit for brunch! 🥐☕',
    productTags: [{ productId: 'p1', x: 30, y: 60 }],
    views: [],
    likes: [],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date()
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

function handlePosts(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/posts') {
    const postsWithData = posts.map(post => ({
      ...post,
      user: users.find(u => u.id === post.userId),
      products: post.productTags.map(tag => ({
        ...tag,
        product: products.find(p => p.id === tag.productId)
      })),
      likesCount: post.likes.length,
      commentsCount: post.comments.length
    }));
    
    sendJSON(res, {
      posts: postsWithData,
      pagination: { current: 1, pages: 1, total: postsWithData.length }
    });
  } else if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/like')) {
    const postId = pathname.split('/')[3];
    const post = posts.find(p => p.id === postId);
    
    if (post) {
      // Toggle like (simplified)
      const likesCount = post.likes.length + 1;
      post.likes.push({ userId: '1', likedAt: new Date() });
      sendJSON(res, { likesCount, isLiked: true });
    } else {
      sendJSON(res, { error: 'Post not found' }, 404);
    }
  }
}

function handleStories(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/stories') {
    const activeStories = stories.filter(story => new Date(story.expiresAt) > new Date());
    const storyGroups = activeStories.map(story => ({
      user: users.find(u => u.id === story.userId),
      stories: [story]
    }));
    
    sendJSON(res, { storyGroups });
  }
}

function handleProducts(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/products') {
    const productsWithVendor = products.map(product => ({
      ...product,
      vendor: users.find(u => u.id === product.vendorId)
    }));
    sendJSON(res, { products: productsWithVendor });
  } else if (req.method === 'GET' && pathname === '/api/products/trending') {
    const trending = products
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map(product => ({
        ...product,
        vendor: users.find(u => u.id === product.vendorId)
      }));
    sendJSON(res, { products: trending });
  }
}

function handleUsers(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/users') {
    sendJSON(res, { users });
  }
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/api/health') {
    sendJSON(res, { 
      status: 'OK', 
      message: 'DFashion Backend is running!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Route handlers
  if (pathname.startsWith('/api/posts')) {
    handlePosts(req, res, pathname);
  } else if (pathname.startsWith('/api/stories')) {
    handleStories(req, res, pathname);
  } else if (pathname.startsWith('/api/products')) {
    handleProducts(req, res, pathname);
  } else if (pathname.startsWith('/api/users')) {
    handleUsers(req, res, pathname);
  } else {
    sendJSON(res, { error: 'Not found' }, 404);
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 DFashion Simple Backend Server');
  console.log('========================================');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log('💾 Using local data (no database required)');
  console.log('🔗 CORS enabled for frontend connection');
  console.log('📱 API endpoints available:');
  console.log('   GET /api/health - Health check');
  console.log('   GET /api/posts - Get posts');
  console.log('   GET /api/stories - Get stories');
  console.log('   GET /api/products - Get products');
  console.log('   GET /api/users - Get users');
  console.log('========================================');
  console.log('✅ Ready to serve Angular frontend!');
});
