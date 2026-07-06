import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

// Prevent user from leaving multiple reviews on the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating of a product
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(stats[0].avgRating * 10) / 10
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 0
      });
    }
  } catch (error) {
    console.error('Error calculating average rating:', error);
  }
};

// Recalculate average rating on save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.product);
});

// Recalculate average rating after remove / delete
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
