import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  getRelatedProducts,
  getFrequentlyBoughtTogether
} from '../controllers/productController.js';
import { adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/related/:id', getRelatedProducts);
router.get('/bought-together/:id', getFrequentlyBoughtTogether);
router.get('/:id', getProductById);

// Admin-only routes with multi-image upload
router.post('/', adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', adminOnly, deleteProduct);

export default router;
