import express from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly view product reviews
router.get('/product/:productId', getProductReviews);

// Add or update a product review (authenticated)
router.post('/', protect, createReview);

export default router;
