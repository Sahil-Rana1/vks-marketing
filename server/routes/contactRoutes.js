import express from 'express';
import {
  submitContactInquiry,
  getContactMessages,
  replyToContactMessage
} from '../controllers/contactController.js';
import { adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public submission route
router.post('/', submitContactInquiry);

// Admin-only message lists and replying
router.get('/', adminOnly, getContactMessages);
router.post('/:id/reply', adminOnly, replyToContactMessage);

export default router;
