import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

/**
 * @desc    Create a new order (Checkout)
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode
  } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      // Mock order creation when database is offline
      const mockOrder = {
        _id: 'mock_order_' + Date.now(),
        user: req.user._id,
        items: items.map(item => ({
          product: item.product,
          title: item.title,
          price: item.price || 249,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        })),
        shippingAddress,
        paymentMethod,
        paymentStatus: 'Pending',
        totalAmount: items.reduce((acc, curr) => acc + (curr.price || 249) * curr.quantity, 0),
        orderStatus: 'Processing',
        timeline: [
          {
            status: 'Processing',
            comment: 'Order placed successfully (Mock mode).'
          }
        ],
        createdAt: new Date()
      };

      return res.status(200).json({
        success: true,
        message: 'Order placed successfully (Mock mode)!',
        order: mockOrder,
        razorpayKeyId: 'rzp_test_mockKeyId'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // 1. Validate stock and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.title}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Product "${product.title}" has insufficient stock. Only ${product.stock} left.` });
      }

      // Calculate item price after discount
      const itemPrice = product.price * (1 - product.discount / 100);
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: itemPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      });
    }

    // 2. Validate Coupon if provided
    let discountAmount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expiryDate > new Date()) {
        if (subtotal >= coupon.minPurchaseAmount) {
          couponApplied = coupon._id;
          if (coupon.discountType === 'Percentage') {
            discountAmount = subtotal * (coupon.discountValue / 100);
            if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    // 3. Calculate taxes and shipping
    // Tax = 18% GST (9% CGST + 9% SGST)
    const taxAmount = Math.round((subtotal - discountAmount) * 0.18 * 100) / 100;

    // Delivery charges: Free shipping above ₹500, else ₹40 shipping
    const deliveryCharges = (subtotal - discountAmount) >= 500 ? 0 : 40;

    const totalAmount = Math.round((subtotal - discountAmount + taxAmount + deliveryCharges) * 100) / 100;

    // 4. Handle Razorpay Preparation (MOCKED / EXTENSIBLE)
    let paymentDetails = {};
    let paymentStatus = 'Pending';

    if (paymentMethod === 'Razorpay') {
      if (!razorpay) {
        return res.status(400).json({ success: false, message: 'Razorpay keys are not configured on the server. Please add them to your environment variables.' });
      }
      try {
        const options = {
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`
        };
        const rzpOrder = await razorpay.orders.create(options);
        paymentDetails = {
          razorpayOrderId: rzpOrder.id
        };
        paymentStatus = 'Pending';
      } catch (rzpError) {
        console.error('Razorpay order creation failed:', rzpError);
        return res.status(500).json({ success: false, message: 'Payment gateway initialization failed' });
      }
    } else {
      // Cash on Delivery
      paymentStatus = 'Pending';
    }

    // 5. Deduct Product Stocks & Create Order
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails,
      coupon: couponApplied,
      discountAmount,
      taxAmount,
      deliveryCharges,
      totalAmount
    });

    // 6. Clear User Cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || ''
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment (for Razorpay integration checkout)
 * @route   POST /api/orders/verify-payment
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Cryptographically verify signature
    const rzpOrderId = order.paymentDetails?.razorpayOrderId;
    if (!rzpOrderId) {
      return res.status(400).json({ success: false, message: 'No Razorpay Order ID found for this order' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(rzpOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: signature mismatch' });
    }

    order.paymentStatus = 'Paid';
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.timeline.push({
      status: 'Processing',
      comment: 'Payment verified and transaction confirmed via Razorpay.'
    });

    await order.save();
    res.status(200).json({ success: true, message: 'Payment verified and order confirmed', order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's order history
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Return temporary mock orders list
      return res.status(200).json({
        success: true,
        orders: [
          {
            _id: 'mock_order_1',
            createdAt: new Date(),
            totalAmount: 249,
            paymentMethod: 'COD',
            orderStatus: 'Processing',
            items: [{ title: '3 in 1 Soap Dispenser with Sponge Holder', quantity: 1, price: 249 }]
          }
        ]
      });
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 || req.params.id.startsWith('mock_order_')) {
      // Return a temporary mock order detail view
      const mockOrder = {
        _id: req.params.id,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '9876543210'
        },
        items: [
          {
            product: 'mock_p1',
            title: '3 in 1 Soap Dispenser with Sponge Holder',
            price: 249,
            quantity: 1
          }
        ],
        shippingAddress: {
          name: req.user.name,
          street: 'Sector 62',
          city: 'Noida',
          state: 'UP',
          postalCode: '201301',
          country: 'India',
          phone: req.user.phone || '9876543210'
        },
        paymentMethod: 'COD',
        paymentStatus: 'Pending',
        totalAmount: 249,
        orderStatus: 'Processing',
        timeline: [
          {
            status: 'Processing',
            comment: 'Order placed successfully (Mock mode).',
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      };

      return res.status(200).json({ success: true, order: mockOrder });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('coupon', 'code discountValue discountType');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorize checks: user is owner or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/admin/list
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res, next) => {
  const { orderStatus, comment, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.timeline.push({
        status: orderStatus,
        comment: comment || `Order status updated to ${orderStatus}`
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    res.status(200).json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard analytics (Admin only)
 * @route   GET /api/orders/admin/analytics
 * @access  Private/Admin
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Total revenue (Paid orders total sum)
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalSales || 0;

    // 2. Orders count
    const totalOrders = await Order.countDocuments();

    // 3. Customers count
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // 4. Products count
    const totalProducts = await Product.countDocuments();

    // 5. Low stock alert (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).select('title stock price sku');

    // 6. Recent 5 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard charts (Admin only)
 * @route   GET /api/orders/admin/charts
 * @access  Private/Admin
 */
export const getDashboardCharts = async (req, res, next) => {
  try {
    // Get sales / revenue grouped by date (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const dailySales = await Order.aggregate([
      { $match: { createdAt: { $gte: lastWeek }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get sales / revenue grouped by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      dailySales,
      monthlySales
    });
  } catch (error) {
    next(error);
  }
};
