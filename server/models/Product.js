import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, default: 'VKS Marketing' },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  features: [{ type: String }],
  specifications: [specificationSchema],
  shipping: { type: String, default: 'Standard Shipping (3-5 business days)' },
  sku: { type: String, required: true, unique: true },
  color: [{ type: String }],
  size: [{ type: String }],
  availability: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Update availability based on stock before saving
productSchema.pre('save', function (next) {
  this.availability = this.stock > 0;
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
