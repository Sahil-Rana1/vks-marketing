import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String }
}, { _id: false });

const orderTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['COD', 'Razorpay'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String }
  },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  deliveryCharges: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  timeline: [orderTimelineSchema]
}, {
  timestamps: true
});

// Pre-save hook to add initial processing state to timeline if empty
orderSchema.pre('save', function (next) {
  if (this.timeline.length === 0) {
    this.timeline.push({
      status: 'Processing',
      comment: 'Your order is being processed and will be shipped soon.'
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
