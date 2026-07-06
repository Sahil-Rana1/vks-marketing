import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Admin-only routes with single category image upload
router.post('/', adminOnly, upload.single('image'), createCategory);
router.put('/:id', adminOnly, upload.single('image'), updateCategory);
router.delete('/:id', adminOnly, deleteCategory);

export default router;
