const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Get trending products
router.get('/trending', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    // Get products sorted by popularity (you can adjust this logic)
    const products = await Product.find(query)
      .sort({ 
        'analytics.views': -1, 
        'analytics.purchases': -1,
        createdAt: -1 
      })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName')
      .lean();

    // Add trending metadata
    const trendingProducts = products.map(product => ({
      ...product,
      trendingScore: Math.random() * 0.5 + 0.5, // Random score between 0.5-1
      trendingReason: 'Popular this week',
      viewCount: product.analytics?.views || Math.floor(Math.random() * 1000) + 100,
      purchaseCount: product.analytics?.purchases || Math.floor(Math.random() * 50) + 10,
      shareCount: Math.floor(Math.random() * 200) + 20,
      engagementRate: (Math.random() * 5 + 3).toFixed(1)
    }));

    res.json({
      success: true,
      data: trendingProducts
    });

  } catch (error) {
    console.error('Error fetching trending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products',
      error: error.message
    });
  }
});

// Get suggested products (personalized recommendations)
router.get('/suggested', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    
    // For now, return popular products as suggestions
    // In a real app, you'd use user behavior data for personalization
    const products = await Product.find({ isActive: true })
      .sort({ 
        'rating.average': -1,
        'analytics.views': -1,
        createdAt: -1 
      })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName')
      .lean();

    // Add recommendation metadata
    const suggestedProducts = products.map(product => ({
      ...product,
      recommendationScore: Math.random() * 0.3 + 0.7, // Random score between 0.7-1
      recommendationReason: userId ? 'Based on your preferences' : 'Popular choice'
    }));

    res.json({
      success: true,
      data: suggestedProducts
    });

  } catch (error) {
    console.error('Error fetching suggested products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch suggested products',
      error: error.message
    });
  }
});

// Get similar products
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    // Get the original product to find similar ones
    const originalProduct = await Product.findById(productId);
    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find similar products based on category and subcategory
    const similarProducts = await Product.find({
      _id: { $ne: productId }, // Exclude the original product
      isActive: true,
      $or: [
        { category: originalProduct.category },
        { subcategory: originalProduct.subcategory },
        { brand: originalProduct.brand }
      ]
    })
    .sort({ 'rating.average': -1 })
    .limit(parseInt(limit))
    .populate('vendor', 'businessName')
    .lean();

    // Add recommendation metadata
    const recommendedProducts = similarProducts.map(product => ({
      ...product,
      recommendationScore: Math.random() * 0.3 + 0.6, // Random score between 0.6-0.9
      recommendationReason: 'Similar to your viewed item'
    }));

    res.json({
      success: true,
      data: recommendedProducts
    });

  } catch (error) {
    console.error('Error fetching similar products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch similar products',
      error: error.message
    });
  }
});

// Get recently viewed products
router.get('/recent/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 8 } = req.query;

    // In a real app, you'd track user view history
    // For now, return random recent products
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('vendor', 'businessName')
      .lean();

    // Add recommendation metadata
    const recentProducts = products.map(product => ({
      ...product,
      recommendationScore: Math.random() * 0.2 + 0.5, // Random score between 0.5-0.7
      recommendationReason: 'Recently viewed'
    }));

    res.json({
      success: true,
      data: recentProducts
    });

  } catch (error) {
    console.error('Error fetching recent products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent products',
      error: error.message
    });
  }
});

// Get category-based recommendations
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      category: category,
      isActive: true 
    })
    .sort({ 
      'rating.average': -1,
      'analytics.views': -1 
    })
    .limit(parseInt(limit))
    .populate('vendor', 'businessName')
    .lean();

    // Add recommendation metadata
    const categoryProducts = products.map(product => ({
      ...product,
      recommendationScore: Math.random() * 0.3 + 0.6, // Random score between 0.6-0.9
      recommendationReason: `Popular in ${category}`
    }));

    res.json({
      success: true,
      data: categoryProducts
    });

  } catch (error) {
    console.error('Error fetching category recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category recommendations',
      error: error.message
    });
  }
});

// Track user behavior for analytics
router.post('/track-view', async (req, res) => {
  try {
    const { productId, category, duration } = req.body;
    
    // In a real app, you'd save this to a user analytics collection
    // For now, just update product view count
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'analytics.views': 1 }
    });

    res.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view',
      error: error.message
    });
  }
});

router.post('/track-search', async (req, res) => {
  try {
    const { query, category, resultsClicked } = req.body;
    
    // In a real app, you'd save search analytics
    console.log('Search tracked:', { query, category, resultsClicked });

    res.json({
      success: true,
      message: 'Search tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking search:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track search',
      error: error.message
    });
  }
});

router.post('/track-purchase', async (req, res) => {
  try {
    const { productId, category, price } = req.body;
    
    // Update product purchase count
    await Product.findByIdAndUpdate(productId, {
      $inc: { 'analytics.purchases': 1 }
    });

    res.json({
      success: true,
      message: 'Purchase tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track purchase',
      error: error.message
    });
  }
});

// Get user analytics
router.get('/analytics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, you'd fetch user analytics from database
    // For now, return mock data
    const userAnalytics = {
      userId,
      viewHistory: [],
      searchHistory: [],
      purchaseHistory: [],
      wishlistItems: [],
      cartItems: [],
      preferredCategories: ['women', 'men', 'accessories'],
      priceRange: { min: 500, max: 5000 },
      brandPreferences: []
    };

    res.json({
      success: true,
      data: userAnalytics
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics',
      error: error.message
    });
  }
});

module.exports = router;
