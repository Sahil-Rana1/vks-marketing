import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['Percentage', 'FixedAmount'], default: 'Percentage' },
  discountValue: { type: Number, required: true }, // percentage or flat amount
  minPurchaseAmount: { type: Number, default: 0 }, // minimum order total to apply this coupon
  maxDiscountAmount: { type: Number, default: 0 }, // cap for percentage discount
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
