import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

// Gracefully handle empty keys to prevent startup crashes
const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET || ''
    })
  : null;

export default razorpay;
