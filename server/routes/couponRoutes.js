import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  deleteCoupon,
  validateCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// User checkout coupon validation
router.post('/validate', protect, validateCoupon);

// Admin-only CRUD operations
router.post('/', adminOnly, createCoupon);
router.get('/', adminOnly, getAllCoupons);
router.delete('/:id', adminOnly, deleteCoupon);

export default router;
