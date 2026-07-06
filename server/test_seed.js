import mongoose from 'mongoose';
import Product from './models/Product.js';

const check = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vks-marketing');
    const products = await Product.find({});
    console.log(`Found ${products.length} products in MongoDB.`);
    products.forEach(p => {
      console.log(`Product: ${p.title} -> Image: ${p.images[0]}`);
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
check();
