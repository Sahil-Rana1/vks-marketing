import Review from '../models/Review.js';
import Product from '../models/Product.js';

/**
 * @desc    Create a product review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user has already reviewed the product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      // Allow updating existing review instead of failing completely! This is a premium user experience.
      alreadyReviewed.rating = parseInt(rating);
      alreadyReviewed.comment = comment;
      await alreadyReviewed.save();

      // Trigger static recalculation since hook triggers on save
      await Review.calculateAverageRating(productId);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        review: alreadyReviewed
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: parseInt(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/product/:productId
 * @access  Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};
