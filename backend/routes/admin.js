const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Story = require('../models/Story');
const Post = require('../models/Post');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const pendingVendors = await User.countDocuments({ 
      role: 'vendor', 
      'vendorInfo.isApproved': false 
    });
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const totalStories = await Story.countDocuments();
    const activeStories = await Story.countDocuments({ 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    const totalPosts = await Post.countDocuments();
    const activePosts = await Post.countDocuments({ isActive: true });

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username fullName role createdAt avatar');

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendor', 'username fullName')
      .select('name price category vendor createdAt images');

    const recentStories = await Story.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username fullName avatar')
      .select('user media caption createdAt analytics');

    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username fullName avatar')
      .select('user caption media createdAt analytics');

    // Get analytics data for charts
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const topPerformingProducts = await Product.find()
      .sort({ 'analytics.purchases': -1 })
      .limit(10)
      .populate('vendor', 'username fullName')
      .select('name price analytics vendor images');

    const topInfluencers = await User.find({ role: { $in: ['customer', 'vendor'] } })
      .sort({ 'socialStats.followersCount': -1 })
      .limit(10)
      .select('username fullName avatar socialStats role');

    res.json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            active: totalUsers - 0, // Assuming all are active for now
            inactive: 0
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            approved: activeProducts,
            pending: totalProducts - activeProducts,
            featured: 0
          },
          orders: {
            total: 0,
            pending: 0,
            confirmed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
          }
        },
        revenue: {
          totalRevenue: 125000,
          averageOrderValue: 2500
        },
        monthlyTrends: userGrowth,
        topCustomers: topInfluencers,
        recentActivities: {
          users: recentUsers,
          products: recentProducts,
          stories: recentStories,
          posts: recentPosts
        },
        analytics: {
          userGrowth,
          productsByCategory,
          topPerformingProducts,
          topInfluencers
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin only)
router.put('/users/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user 
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve vendor
// @access  Private (Admin only)
router.put('/vendors/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vendor' },
      { 'vendorInfo.isApproved': true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ 
      message: 'Vendor approved successfully',
      user 
    });
  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
