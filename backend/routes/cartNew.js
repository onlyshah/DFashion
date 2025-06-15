const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

// Test endpoint to check if routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Cart routes are working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint with auth
router.get('/test-auth', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Cart auth is working',
    user: req.user.email,
    role: req.user.role,
    timestamp: new Date().toISOString()
  });
});

// Get cart count only (lightweight endpoint)
router.get('/count', auth, requireRole(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true })
      .select('totalItems items');

    if (!cart) {
      return res.json({
        success: true,
        count: 0,
        totalItems: 0,
        itemCount: 0
      });
    }

    // Calculate accurate counts
    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    const itemCount = cart.items.length;

    res.json({
      success: true,
      count: totalItems, // Total quantity of all items
      totalItems: totalItems,
      itemCount: itemCount, // Number of unique items
      lastUpdated: cart.lastUpdated
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart count',
      error: error.message
    });
  }
});

// Get user's cart
router.get('/', auth, requireRole(['customer']), async (req, res) => {
  try {
    console.log('🛒 Getting cart for user:', req.user._id);
    console.log('🛒 User object:', req.user);

    // First, try to find existing cart
    let cart = await Cart.findOne({ user: req.user._id, isActive: true });
    console.log('🛒 Existing cart found:', cart ? 'Yes' : 'No');

    if (!cart) {
      console.log('🛒 Creating new cart for user');
      cart = new Cart({ user: req.user._id });
      await cart.save();
      console.log('🛒 New cart created:', cart._id);
    }

    // Try to populate the cart
    try {
      cart = await Cart.findById(cart._id)
        .populate({
          path: 'items.product',
          select: 'name images price originalPrice brand category isActive sizes colors vendor',
          populate: {
            path: 'vendor',
            select: 'username fullName vendorInfo.businessName'
          }
        });
      console.log('🛒 Cart populated successfully');
    } catch (populateError) {
      console.error('❌ Populate error:', populateError);
      // Continue without population
    }

    console.log('🛒 Cart items count:', cart?.items?.length || 0);

    // Get summary safely
    let summary;
    try {
      summary = cart.summary;
      console.log('🛒 Summary generated successfully');
    } catch (summaryError) {
      console.error('❌ Summary error:', summaryError);
      summary = {
        totalItems: 0,
        totalAmount: 0,
        totalSavings: 0,
        itemCount: 0
      };
    }

    res.json({
      success: true,
      cart: cart,
      summary: summary
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { productId, quantity = 1, size, color, addedFrom = 'manual', notes } = req.body;

    // Validate product exists and is active
    const product = await Product.findById(productId).populate('vendor');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Get or create cart
    const cart = await Cart.findOrCreateForUser(req.user._id);

    // Add item to cart
    cart.addItem({
      product: productId,
      quantity: parseInt(quantity),
      size: size,
      color: color,
      price: product.price,
      originalPrice: product.originalPrice,
      addedFrom: addedFrom,
      notes: notes,
      vendor: product.vendor._id
    });

    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category isActive',
      populate: {
        path: 'vendor',
        select: 'username fullName vendorInfo.businessName'
      }
    });

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// Update item quantity in cart
router.put('/update/:itemId', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, size, color, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update item properties
    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.removeItem(itemId);
      } else {
        cart.updateItemQuantity(itemId, parseInt(quantity));
      }
    }

    if (size !== undefined) item.size = size;
    if (color !== undefined) item.color = color;
    if (notes !== undefined) item.notes = notes;

    if (item.parent()) {
      item.updatedAt = new Date();
    }

    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category isActive',
      populate: {
        path: 'vendor',
        select: 'username fullName vendorInfo.businessName'
      }
    });

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.removeItem(itemId);
    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category isActive',
      populate: {
        path: 'vendor',
        select: 'username fullName vendorInfo.businessName'
      }
    });

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
});

// Bulk remove items from cart
router.delete('/bulk-remove', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Item IDs array is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove multiple items
    let removedCount = 0;
    itemIds.forEach(itemId => {
      const itemExists = cart.items.id(itemId);
      if (itemExists) {
        cart.removeItem(itemId);
        removedCount++;
      }
    });

    await cart.save();

    // Populate the cart for response
    await cart.populate({
      path: 'items.product',
      select: 'name images price originalPrice brand category isActive',
      populate: {
        path: 'vendor',
        select: 'username fullName vendorInfo.businessName'
      }
    });

    res.json({
      success: true,
      message: `${removedCount} item(s) removed from cart successfully`,
      removedCount: removedCount,
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Bulk remove cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove items from cart',
      error: error.message
    });
  }
});

// Clear entire cart
router.delete('/clear', auth, requireRole(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemCount = cart.items.length;
    cart.clearCart();
    await cart.save();

    res.json({
      success: true,
      message: `Cart cleared successfully. ${itemCount} item(s) removed.`,
      clearedCount: itemCount,
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

// Get cart items grouped by vendor
router.get('/vendors', auth, requireRole(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user._id)
      .populate({
        path: 'items.product',
        select: 'name images price originalPrice brand category isActive',
        populate: {
          path: 'vendor',
          select: 'username fullName vendorInfo.businessName avatar'
        }
      });

    const vendorGroups = cart.getItemsByVendor();

    res.json({
      success: true,
      vendorGroups: vendorGroups,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Get cart vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart vendors',
      error: error.message
    });
  }
});

// Move item from cart to wishlist
router.post('/move-to-wishlist/:itemId', auth, requireRole(['customer']), async (req, res) => {
  try {
    const { itemId } = req.params;
    const Wishlist = require('../models/Wishlist');

    const cart = await Cart.findOne({ user: req.user._id, isActive: true });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Get or create wishlist
    const wishlist = await Wishlist.findOrCreateForUser(req.user._id);

    // Add item to wishlist
    wishlist.addItem({
      product: item.product,
      size: item.size,
      color: item.color,
      price: item.price,
      originalPrice: item.originalPrice,
      addedFrom: 'cart',
      notes: item.notes,
      vendor: item.vendor
    });

    // Remove item from cart
    cart.removeItem(itemId);

    await Promise.all([cart.save(), wishlist.save()]);

    res.json({
      success: true,
      message: 'Item moved to wishlist successfully'
    });
  } catch (error) {
    console.error('Move to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move item to wishlist',
      error: error.message
    });
  }
});

module.exports = router;
