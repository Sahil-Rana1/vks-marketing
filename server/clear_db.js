import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';

const clear = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/vks-marketing');
    console.log('Connected to MongoDB.');
    
    const resProducts = await Product.deleteMany({});
    const resCategories = await Category.deleteMany({});
    
    console.log(`Deleted ${resProducts.deletedCount} products and ${resCategories.deletedCount} categories.`);
    console.log('Database collections cleared successfully! The server will auto-seed correct data on next startup.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clear();
