import express from 'express';
import {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserAddresses,
  loginAdmin
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public User Auth
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private User Profile & Addresses
router.get('/profile', protect, getUserProfile);
router.put('/addresses', protect, updateUserAddresses);

// Public Admin Auth
router.post('/admin/login', loginAdmin);

export default router;
