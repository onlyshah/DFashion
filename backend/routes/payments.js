const express = require('express');
const router = express.Router();
const { auth, requireCustomer } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const crypto = require('crypto');

// All routes require authentication
router.use(auth);

// @route   POST /api/payments/initiate
// @desc    Initiate payment for an order
// @access  Private
router.post('/initiate', requireCustomer, async (req, res) => {
  try {
    const { orderId, paymentMethod, returnUrl } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment method are required'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Create payment record
    const payment = new Payment({
      order: orderId,
      customer: req.user.userId,
      amount: order.totalAmount,
      paymentMethod,
      gatewayTransactionId: Payment.generatePaymentReference(),
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Handle different payment methods
    let paymentResponse = {};

    switch (paymentMethod) {
      case 'cod':
        payment.status = 'completed';
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();
        paymentResponse = {
          paymentId: payment._id,
          status: 'completed',
          message: 'Cash on Delivery order confirmed'
        };
        break;

      case 'card':
      case 'upi':
      case 'netbanking':
      case 'wallet':
        // For demo purposes, simulate payment gateway
        payment.paymentGateway = 'razorpay';
        payment.gatewayOrderId = `order_${Date.now()}`;
        payment.gatewayPaymentId = `pay_${Date.now()}`;
        
        // For demo purposes, always succeed
        payment.status = 'completed';
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        await order.save();

        paymentResponse = {
          paymentId: payment._id,
          gatewayPaymentId: payment.gatewayPaymentId,
          status: 'completed',
          message: 'Payment successful',
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: payment.amount
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    await payment.save();

    res.json({
      success: true,
      data: paymentResponse
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
});

// @route   GET /api/payments/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('order', 'orderNumber totalAmount status')
      .populate('customer', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check access permissions
    const hasAccess = payment.customer._id.toString() === req.user.userId ||
                     ['admin', 'sales_manager', 'support_manager'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// @route   GET /api/payments
// @desc    Get user's payment history
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { customer: req.user.userId };
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const payments = await Payment.find(filter)
      .populate('order', 'orderNumber totalAmount status items')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / parseInt(limit)),
          totalPayments
        }
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// @route   POST /api/payments/:paymentId/refund
// @desc    Request payment refund
// @access  Private
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { reason, amount } = req.body;
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns the payment
    if (payment.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment can be refunded
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    // Check if already refunded
    if (payment.refund && payment.refund.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment is already refunded'
      });
    }

    const refundAmount = amount || payment.amount;

    payment.refund = {
      amount: refundAmount,
      reason,
      status: 'pending'
    };

    await payment.save();

    res.json({
      success: true,
      message: 'Refund request submitted successfully'
    });

  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund request'
    });
  }
});

module.exports = router;
