import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardAnalytics,
  getDashboardCharts
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User Order Management (Private)
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin Dashboard Analytics & Ordering (Admin Only)
router.get('/admin/analytics', adminOnly, getDashboardAnalytics);
router.get('/admin/charts', adminOnly, getDashboardCharts);
router.get('/admin/list', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;
