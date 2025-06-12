const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');

// Get user's cart
router.get('/', auth, requireRole(['customer']), async (req, res) => {
  try {
    const cart = await Cart.findOrCreateForUser(req.user._id)
      .populate({
        path: 'items.product',
        select: 'name images price originalPrice brand category isActive sizes colors vendor',
        populate: {
          path: 'vendor',
          select: 'username fullName vendorInfo.businessName'
        }
      });

    res.json({
      success: true,
      cart: cart,
      summary: cart.summary
    });
  } catch (error) {
    console.error('Get cart error:', error);
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

    cart.clearCart();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
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
