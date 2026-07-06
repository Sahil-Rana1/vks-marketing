import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

let MOCK_WISHLISTS_DB = {};

/**
 * @desc    Get user wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
export const getWishlist = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_WISHLISTS_DB[req.user._id]) {
        MOCK_WISHLISTS_DB[req.user._id] = { user: req.user._id, products: [] };
      }
      return res.status(200).json({ success: true, wishlist: MOCK_WISHLISTS_DB[req.user._id] });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'title slug price discount images stock availability rating brand'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in wishlist (Add/Remove)
 * @route   POST /api/wishlist/toggle
 * @access  Private
 */
export const toggleWishlist = async (req, res, next) => {
  const { productId } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_WISHLISTS_DB[req.user._id]) {
        MOCK_WISHLISTS_DB[req.user._id] = { user: req.user._id, products: [] };
      }
      const wishlist = MOCK_WISHLISTS_DB[req.user._id];
      const productsData = [
        { _id: 'mock_p1', title: '3 in 1 Soap Dispenser with Sponge Holder', price: 249, discount: 20, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop'], slug: '3-in-1-soap-dispenser' },
        { _id: 'mock_p2', title: 'Hanging Multi-Slot Sunglasses Organizer', price: 381.50, discount: 36, images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop'], slug: 'sunglasses-organizer' },
        { _id: 'mock_p3', title: 'Toys & Cosmetic Organiser Box', price: 381.50, discount: 36, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'], slug: 'cosmetic-organizer' },
        { _id: 'mock_p4', title: 'Travel Toothbrush Holder Cup', price: 87.20, discount: 56, images: ['https://images.unsplash.com/photo-1620626011761-996317b69766?q=80&w=600&auto=format&fit=crop'], slug: 'toothbrush-holder' },
        { _id: 'mock_p5', title: 'Multi-functional Hexagon Extension Board', price: 359.70, discount: 28, images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop'], slug: 'extension-board' },
        { _id: 'mock_p6', title: 'Airtight Kitchen Storage Container Set', price: 1999, discount: 30, images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop'], slug: 'kitchen-storage-boxes' }
      ];
      const prod = productsData.find(p => p._id === productId) || productsData[0];
      
      const isAdded = wishlist.products.some(p => p._id === productId);
      let message = '';
      if (isAdded) {
        wishlist.products = wishlist.products.filter(p => p._id !== productId);
        message = 'Product removed from wishlist';
      } else {
        wishlist.products.push(prod);
        message = 'Product added to wishlist';
      }
      return res.status(200).json({ success: true, message, wishlist });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const isAdded = wishlist.products.includes(productId);
    let message = '';

    if (isAdded) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
      message = 'Product removed from wishlist';
    } else {
      wishlist.products.push(productId);
      message = 'Product added to wishlist';
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'products',
      select: 'title slug price discount images stock availability rating brand'
    });

    res.status(200).json({ success: true, message, wishlist });
  } catch (error) {
    next(error);
  }
};
