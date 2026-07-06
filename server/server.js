import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Config imports
import connectDB from './config/db.js';
import { seedAdmin } from './controllers/authController.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ES Module dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize environment variables
dotenv.config();

// Seeder for VKS Product Catalog matching user PDF sheets
const seedCatalog = async () => {
  try {
    let cats = await Category.find();
    if (cats.length === 0) {
      cats = await Category.insertMany([
        { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Premium airtight storage containers and dispensers.' },
        { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Sanitizers and wall organizers for clean spaces.' },
        { name: 'Home Organizers', slug: 'home-organizers', description: 'Clutter-free storage bins and sunglasses cases.' },
        { name: 'Household Essentials', slug: 'household-essentials', description: 'Multi-plugs, extension boards, and spike guards.' }
      ]);
      console.log('--- DATABASE SEED --- Categories seeded successfully!');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const catMap = {};
      cats.forEach(c => { catMap[c.name] = c._id; });
      
      await Product.insertMany([
        {
          title: '3 in 1 Soap Dispenser with Sponge Holder',
          slug: '3-in-1-soap-dispenser',
          description: 'Unbreakable 3-in-1 kitchen hand wash & dish soap dispenser with integrated sponge holder slot. Keeps counters clean and clutter-free.',
          price: 249,
          discount: 20,
          images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Kitchen & Dining'],
          rating: 4.9,
          stock: 4,
          featured: true,
          trending: true,
          sku: 'SD-3IN1',
          brand: 'VKS Marketing'
        },
        {
          title: 'Hanging Multi-Slot Sunglasses Organizer',
          slug: 'sunglasses-organizer',
          description: 'Hanging wall-mounted sunglasses holder with multiple storage slots. Hard velvet lining protects goggles and eyewear.',
          price: 381.50,
          discount: 36,
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Home Organizers'],
          rating: 4.7,
          stock: 15,
          featured: true,
          trending: true,
          sku: 'SG-SLOTS',
          brand: 'VKS Marketing'
        },
        {
          title: 'Toys & Cosmetic Organiser Box',
          slug: 'cosmetic-organizer',
          description: 'Multipurpose storage container basket with secure lid. Ideal for wardrobe organization, toys, makeup, and household clutter.',
          price: 381.50,
          discount: 36,
          images: ['https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Home Organizers'],
          rating: 4.6,
          stock: 12,
          featured: true,
          trending: false,
          sku: 'CO-BASKET',
          brand: 'VKS Marketing'
        },
        {
          title: 'Travel Toothbrush Holder Cup',
          slug: 'toothbrush-holder',
          description: 'Portable travel toothbrush and toothpaste storage case cup. Compact square shape, perfect for outdoor camping and trips.',
          price: 87.20,
          discount: 56,
          images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Bathroom Accessories'],
          rating: 4.5,
          stock: 50,
          featured: true,
          trending: false,
          sku: 'TB-TRAVEL',
          brand: 'VKS Marketing'
        },
        {
          title: 'Multi-functional Hexagon Extension Board',
          slug: 'extension-board',
          description: 'Hexagonal premium power strip extension board with 4 USB charging ports and 4 universal multi-plug outlets. Built-in surge protection spike guard.',
          price: 359.70,
          discount: 28,
          images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Household Essentials'],
          rating: 4.8,
          stock: 30,
          featured: false,
          trending: true,
          sku: 'EB-HEX4',
          brand: 'VKS Marketing'
        },
        {
          title: 'Airtight Kitchen Storage Container Set',
          slug: 'kitchen-storage-boxes',
          description: 'Modular leakproof dry kitchen storage container boxes. BPA free plastic with airtight vacuum snap locks.',
          price: 1999,
          discount: 30,
          images: ['https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=600&auto=format&fit=crop'],
          category: catMap['Kitchen & Dining'],
          rating: 4.9,
          stock: 20,
          featured: true,
          trending: true,
          sku: 'KB-AIRLOCK',
          brand: 'VKS Marketing'
        }
      ]);
      console.log('--- DATABASE SEED --- Products seeded successfully!');
    }
  } catch (error) {
    console.error('Database catalog seeding error:', error);
  }
};

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image retrieval from local static /uploads folder
}));

// Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS Config
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: [clientUrl, 'http://localhost:5174'],
  credentials: true
}));

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder routing for image uploads fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Base server status route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Seed default Admin on server start
seedAdmin();
seedCatalog();

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`VKS Marketing Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Trigger reload for fresh database seeding
