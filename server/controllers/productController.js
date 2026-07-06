import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { uploadImage } from '../config/cloudinary.js';

const MOCK_PRODUCTS_DATA = [
  {
    _id: 'mock_p1',
    title: '3 in 1 Soap Dispenser with Sponge Holder',
    slug: '3-in-1-soap-dispenser',
    description: 'Unbreakable 3-in-1 kitchen hand wash & dish soap dispenser with integrated sponge holder slot. Keeps counters clean and clutter-free.',
    price: 249,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_kd', name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    rating: 4.9,
    stock: 4,
    featured: true,
    trending: true,
    sku: 'SD-3IN1',
    brand: 'VKS Marketing',
    color: ['Blue', 'Green'],
    size: ['Standard'],
    features: ['Unbreakable material', 'Space-saving design', 'Easy single-hand press'],
    specifications: [{ name: 'Material', value: 'BPA-Free ABS' }, { name: 'Capacity', value: '400ml' }]
  },
  {
    _id: 'mock_p2',
    title: 'Hanging Multi-Slot Sunglasses Organizer',
    slug: 'sunglasses-organizer',
    description: 'Hanging wall-mounted sunglasses holder with multiple storage slots. Hard velvet lining protects goggles and eyewear.',
    price: 381.50,
    discount: 36,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_ho', name: 'Home Organizers', slug: 'home-organizers' },
    rating: 4.7,
    stock: 15,
    featured: true,
    trending: true,
    sku: 'SG-SLOTS',
    brand: 'VKS Marketing',
    color: ['Brown', 'Black'],
    size: ['5-Slot', '6-Slot'],
    features: ['Soft velvet padding', 'Roll-up layout', 'Sturdy brass hanger'],
    specifications: [{ name: 'Material', value: 'PU Leather + Velvet' }, { name: 'Slots', value: '5 slots' }]
  },
  {
    _id: 'mock_p3',
    title: 'Toys & Cosmetic Organiser Box',
    slug: 'cosmetic-organizer',
    description: 'Multipurpose storage container basket with secure lid. Ideal for wardrobe organization, toys, makeup, and household clutter.',
    price: 381.50,
    discount: 36,
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_ho', name: 'Home Organizers', slug: 'home-organizers' },
    rating: 4.6,
    stock: 12,
    featured: true,
    trending: false,
    sku: 'CO-BASKET',
    brand: 'VKS Marketing',
    color: ['White', 'Pink'],
    size: ['Large'],
    features: ['Eco friendly plastic', 'Clip lid locks', 'Integrated handles'],
    specifications: [{ name: 'Material', value: 'Eco-PP Plastic' }, { name: 'Dimensions', value: '30x20x15 cm' }]
  },
  {
    _id: 'mock_p4',
    title: 'Travel Toothbrush Holder Cup',
    slug: 'toothbrush-holder',
    description: 'Portable travel toothbrush and toothpaste storage case cup. Compact square shape, perfect for outdoor camping and trips.',
    price: 87.20,
    discount: 56,
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_ba', name: 'Bathroom Accessories', slug: 'bathroom-accessories' },
    rating: 4.5,
    stock: 50,
    featured: true,
    trending: false,
    sku: 'TB-TRAVEL',
    brand: 'VKS Marketing',
    color: ['Translucent Gray', 'Clear'],
    size: ['Standard'],
    features: ['Dustproof cap', 'Sturdy travel hanger', 'Double cup usage'],
    specifications: [{ name: 'Material', value: 'Food-grade PP' }, { name: 'Weight', value: '90g' }]
  },
  {
    _id: 'mock_p5',
    title: 'Multi-functional Hexagon Extension Board',
    slug: 'extension-board',
    description: 'Hexagonal premium power strip extension board with 4 USB charging ports and 4 universal multi-plug outlets. Built-in surge protection spike guard.',
    price: 359.70,
    discount: 28,
    images: ['https://images.unsplash.com/photo-1624996379697-f01d168b1a52?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_he', name: 'Household Essentials', slug: 'household-essentials' },
    rating: 4.8,
    stock: 30,
    featured: false,
    trending: true,
    sku: 'EB-HEX4',
    brand: 'VKS Marketing',
    color: ['Multi-color', 'White'],
    size: ['1.8m Cord'],
    features: ['Surge spike defender', 'Fire-resistant housing', '4 USB intelligent output ports'],
    specifications: [{ name: 'Cord length', value: '1.8 meters' }, { name: 'USB Output', value: '5V 2.1A' }]
  },
  {
    _id: 'mock_p6',
    title: 'Airtight Kitchen Storage Container Set',
    slug: 'kitchen-storage-boxes',
    description: 'Modular leakproof dry kitchen storage container boxes. BPA free plastic with airtight vacuum snap locks.',
    price: 1999,
    discount: 30,
    images: ['https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=600&auto=format&fit=crop'],
    category: { _id: 'mock_cat_kd', name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    rating: 4.9,
    stock: 20,
    featured: true,
    trending: true,
    sku: 'KB-AIRLOCK',
    brand: 'VKS Marketing',
    color: ['Clear with black lids'],
    size: ['7-Piece Set'],
    features: ['Vacuum tight seal', 'Stackable space saver', 'Chalkboard labels included'],
    specifications: [{ name: 'Material', value: 'FDA food-grade AS' }, { name: 'Count', value: '7 containers' }]
  }
];

// Helper function to generate slug from title
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

/**
 * @desc    Create a product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      price,
      discount,
      stock,
      features,
      specifications,
      shipping,
      sku,
      color,
      size,
      featured,
      trending
    } = req.body;

    // Check if sku already exists
    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists' });
    }

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) images.push(url);
      }
    } else {
      // Fallback placeholder image if no images provided
      images.push('https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000&auto=format&fit=crop');
    }

    const slug = slugify(title);
    // Double check slug uniqueness
    const slugExists = await Product.findOne({ slug });
    const finalSlug = slugExists ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Parse arrays and spec objects
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    const parsedColors = typeof color === 'string' ? JSON.parse(color) : color;
    const parsedSizes = typeof size === 'string' ? JSON.parse(size) : size;

    const product = await Product.create({
      title,
      slug: finalSlug,
      description,
      images,
      category,
      brand,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      stock: parseInt(stock),
      features: parsedFeatures || [],
      specifications: parsedSpecs || [],
      shipping,
      sku,
      color: parsedColors || [],
      size: parsedSizes || [],
      featured: featured === 'true' || featured === true,
      trending: trending === 'true' || trending === true
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateFields = { ...req.body };

    // Update slug if title is modified
    if (updateFields.title && updateFields.title !== product.title) {
      const slug = slugify(updateFields.title);
      const slugExists = await Product.findOne({ slug, _id: { $ne: id } });
      updateFields.slug = slugExists ? `${slug}-${Date.now().toString().slice(-4)}` : slug;
    }

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadImage(file);
        if (url) newImages.push(url);
      }
      // If user uploaded new images, we replace or append? Let's replace by default or merge.
      // We will merge/replace depending on append flag or just replace. Let's merge them!
      updateFields.images = [...(updateFields.keepExistingImages ? product.images : []), ...newImages];
    }

    // Parse JSON strings from form-data if present
    if (typeof updateFields.features === 'string') updateFields.features = JSON.parse(updateFields.features);
    if (typeof updateFields.specifications === 'string') updateFields.specifications = JSON.parse(updateFields.specifications);
    if (typeof updateFields.color === 'string') updateFields.color = JSON.parse(updateFields.color);
    if (typeof updateFields.size === 'string') updateFields.size = JSON.parse(updateFields.size);

    // Casting numbers
    if (updateFields.price) updateFields.price = parseFloat(updateFields.price);
    if (updateFields.discount) updateFields.discount = parseFloat(updateFields.discount);
    if (updateFields.stock) updateFields.stock = parseInt(updateFields.stock);

    product = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products (with advanced filters, sorting, search)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...MOCK_PRODUCTS_DATA];
      const { search, category, featured, trending } = req.query;

      if (search) {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (category) {
        filtered = filtered.filter(p => p.category._id === category || p.category.slug === category);
      }
      if (featured === 'true') {
        filtered = filtered.filter(p => p.featured);
      }
      if (trending === 'true') {
        filtered = filtered.filter(p => p.trending);
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        total: filtered.length,
        pages: 1,
        currentPage: 1,
        products: filtered
      });
    }

    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      availability,
      sort,
      page,
      limit,
      featured,
      trending
    } = req.query;

    const query = {};

    // Text Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by Category (slug or ID)
    if (category) {
      query.category = category;
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by Rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by Availability (Stock > 0)
    if (availability === 'true') {
      query.stock = { $gt: 0 };
    } else if (availability === 'false') {
      query.stock = 0;
    }

    // Featured & Trending flags
    if (featured === 'true') {
      query.featured = true;
    }
    if (trending === 'true') {
      query.trending = true;
    }

    // Sorting Options
    let sortQuery = { createdAt: -1 }; // default: new arrivals
    if (sort) {
      if (sort === 'priceAsc') {
        sortQuery = { price: 1 };
      } else if (sort === 'priceDesc') {
        sortQuery = { price: -1 };
      } else if (sort === 'ratingDesc') {
        sortQuery = { rating: -1 };
      } else if (sort === 'trending') {
        sortQuery = { trending: -1, createdAt: -1 };
      }
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by Slug
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = MOCK_PRODUCTS_DATA.find(p => p.slug === req.params.slug);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found (Mock mode)' });
      }
      return res.status(200).json({ success: true, product });
    }

    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = MOCK_PRODUCTS_DATA.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found (Mock mode)' });
      }
      return res.status(200).json({ success: true, product });
    }

    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get related products (Same category, excluding current product)
 * @route   GET /api/products/related/:id
 * @access  Public
 */
export const getRelatedProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const current = MOCK_PRODUCTS_DATA.find(p => p._id === req.params.id);
      const catId = current ? current.category._id : '';
      const related = MOCK_PRODUCTS_DATA.filter(p => p.category._id === catId && p._id !== req.params.id).slice(0, 4);
      return res.status(200).json({ success: true, products: related });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .limit(4)
      .populate('category', 'name slug');

    res.status(200).json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Frequently Bought Together (Products in same category or featured items)
 * @route   GET /api/products/bought-together/:id
 * @access  Public
 */
export const getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const recommendations = MOCK_PRODUCTS_DATA.filter(p => p._id !== req.params.id).slice(0, 2);
      return res.status(200).json({ success: true, products: recommendations });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Fetch up to 2 other products from same category, or featured if category is thin
    let recommendations = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      stock: { $gt: 0 }
    }).limit(2);

    if (recommendations.length < 2) {
      const extraRecs = await Product.find({
        _id: { $nin: [product._id, ...recommendations.map(r => r._id)] },
        stock: { $gt: 0 }
      }).limit(2 - recommendations.length);
      recommendations = [...recommendations, ...extraRecs];
    }

    res.status(200).json({ success: true, products: recommendations });
  } catch (error) {
    next(error);
  }
};
