import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

let MOCK_CARTS_DB = {};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_CARTS_DB[req.user._id]) {
        MOCK_CARTS_DB[req.user._id] = { user: req.user._id, items: [] };
      }
      return res.status(200).json({ success: true, cart: MOCK_CARTS_DB[req.user._id] });
    }

    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'title slug price discount images stock availability brand'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
export const addToCart = async (req, res, next) => {
  const { productId, quantity, color, size } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_CARTS_DB[req.user._id]) {
        MOCK_CARTS_DB[req.user._id] = { user: req.user._id, items: [] };
      }
      const cart = MOCK_CARTS_DB[req.user._id];
      const productsData = [
        { _id: 'mock_p1', title: '3 in 1 Soap Dispenser with Sponge Holder', price: 249, discount: 20, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop'], slug: '3-in-1-soap-dispenser' },
        { _id: 'mock_p2', title: 'Hanging Multi-Slot Sunglasses Organizer', price: 381.50, discount: 36, images: ['https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop'], slug: 'sunglasses-organizer' },
        { _id: 'mock_p3', title: 'Toys & Cosmetic Organiser Box', price: 381.50, discount: 36, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop'], slug: 'cosmetic-organizer' },
        { _id: 'mock_p4', title: 'Travel Toothbrush Holder Cup', price: 87.20, discount: 56, images: ['https://images.unsplash.com/photo-1620626011761-996317b69766?q=80&w=600&auto=format&fit=crop'], slug: 'toothbrush-holder' },
        { _id: 'mock_p5', title: 'Multi-functional Hexagon Extension Board', price: 359.70, discount: 28, images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop'], slug: 'extension-board' },
        { _id: 'mock_p6', title: 'Airtight Kitchen Storage Container Set', price: 1999, discount: 30, images: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600&auto=format&fit=crop'], slug: 'kitchen-storage-boxes' }
      ];
      const prod = productsData.find(p => p._id === productId) || productsData[0];
      
      const existingIndex = cart.items.findIndex(
        (item) =>
          item.product?._id === productId &&
          item.color === color &&
          item.size === size
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += parseInt(quantity);
      } else {
        cart.items.push({
          product: prod,
          quantity: parseInt(quantity),
          color,
          size
        });
      }
      return res.status(200).json({ success: true, message: 'Added to cart successfully (Mock mode)', cart });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already exists with same product, color, and size
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (existingIndex > -1) {
      // Validate total requested stock
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity);
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock. You already have ${cart.items[existingIndex].quantity} in cart.` });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: parseInt(quantity), color, size });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'title slug price discount images stock availability brand'
    });

    res.status(200).json({ success: true, message: 'Item added to cart successfully', cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update
 * @access  Private
 */
export const updateCartItem = async (req, res, next) => {
  const { productId, quantity, color, size } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_CARTS_DB[req.user._id]) {
        MOCK_CARTS_DB[req.user._id] = { user: req.user._id, items: [] };
      }
      const cart = MOCK_CARTS_DB[req.user._id];
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product?._id === productId &&
          item.color === color &&
          item.size === size
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = parseInt(quantity);
        return res.status(200).json({ success: true, message: 'Cart updated successfully (Mock mode)', cart });
      }
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = parseInt(quantity);
      await cart.save();
      await cart.populate({
        path: 'items.product',
        select: 'title slug price discount images stock availability brand'
      });
      return res.status(200).json({ success: true, message: 'Cart updated successfully', cart });
    }

    res.status(404).json({ success: false, message: 'Item not found in cart' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove
 * @access  Private
 */
export const removeFromCart = async (req, res, next) => {
  const { productId, color, size } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      if (!MOCK_CARTS_DB[req.user._id]) {
        MOCK_CARTS_DB[req.user._id] = { user: req.user._id, items: [] };
      }
      const cart = MOCK_CARTS_DB[req.user._id];
      cart.items = cart.items.filter(
        (item) =>
          !(item.product?._id === productId &&
            item.color === color &&
            item.size === size)
      );
      return res.status(200).json({ success: true, message: 'Item removed from cart (Mock mode)', cart });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(item.product.toString() === productId &&
          item.color === color &&
          item.size === size)
    );

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'title slug price discount images stock availability brand'
    });

    res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared successfully', cart });
  } catch (error) {
    next(error);
  }
};
