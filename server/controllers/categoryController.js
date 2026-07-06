import Category from '../models/Category.js';
import mongoose from 'mongoose';
import { uploadImage } from '../config/cloudinary.js';

const MOCK_CATEGORIES = [
  { _id: 'mock_cat_kd', name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Premium airtight storage containers and dispensers.' },
  { _id: 'mock_cat_ba', name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Sanitizers and wall organizers for clean spaces.' },
  { _id: 'mock_cat_ho', name: 'Home Organizers', slug: 'home-organizers', description: 'Clutter-free storage bins and sunglasses cases.' },
  { _id: 'mock_cat_he', name: 'Household Essentials', slug: 'household-essentials', description: 'Multi-plugs, extension boards, and spike guards.' }
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * @desc    Create a category (Admin only)
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const slug = slugify(name);
    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl
    });

    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: MOCK_CATEGORIES.length, categories: MOCK_CATEGORIES });
    }
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const category = MOCK_CATEGORIES.find(c => c.slug === req.params.slug);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found (Mock mode)' });
      }
      return res.status(200).json({ success: true, category });
    }
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category (Admin only)
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const updateFields = { description };

    if (name && name !== category.name) {
      updateFields.name = name;
      updateFields.slug = slugify(name);
    }

    if (req.file) {
      const imageUrl = await uploadImage(req.file);
      if (imageUrl) updateFields.image = imageUrl;
    }

    category = await Category.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category (Admin only)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
