import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers
} from '../controllers/newsletterController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public subscription routes
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Admin-only list of subscribers
router.get('/subscribers', adminOnly, getSubscribers);

export default router;
