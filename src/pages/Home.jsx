import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight,
  FiAward,
  FiTruck,
  FiShield,
  FiClock,
  FiStar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/LoadingSkeleton.jsx';
import OrganizerQuiz from '../components/OrganizerQuiz.jsx';
import API from '../services/api.js';

// Realistic product images matching VKS Marketing brand
const MOCK_PRODUCTS = [
  {
    _id: 'mock_p1',
    title: '3 in 1 Soap Dispenser with Sponge Holder',
    slug: '3-in-1-soap-dispenser',
    description: 'Unbreakable 3-in-1 kitchen hand wash & dish soap dispenser with integrated sponge holder slot. Keeps counters clean and clutter-free.',
    price: 249,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    rating: 4.9,
    stock: 4,
    featured: true,
    trending: true,
    sku: 'SD-3IN1',
    brand: 'VKS Marketing'
  },
  {
    _id: 'mock_p2',
    title: 'Hanging Multi-Slot Sunglasses Organizer',
    slug: 'sunglasses-organizer',
    description: 'Hanging wall-mounted sunglasses holder with multiple storage slots. Hard velvet lining protects goggles and eyewear.',
    price: 381.50,
    discount: 36,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Home Organizers', slug: 'home-organizers' },
    rating: 4.7,
    stock: 15,
    featured: true,
    trending: true,
    sku: 'SG-SLOTS',
    brand: 'VKS Marketing'
  },
  {
    _id: 'mock_p3',
    title: 'Toys & Cosmetic Organiser Box',
    slug: 'cosmetic-organizer',
    description: 'Multipurpose storage container basket with secure lid. Ideal for wardrobe organization, toys, makeup, and household clutter.',
    price: 381.50,
    discount: 36,
    images: ['https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Home Organizers', slug: 'home-organizers' },
    rating: 4.6,
    stock: 12,
    featured: true,
    trending: false,
    sku: 'CO-BASKET',
    brand: 'VKS Marketing'
  },
  {
    _id: 'mock_p4',
    title: 'Travel Toothbrush Holder Cup',
    slug: 'toothbrush-holder',
    description: 'Portable travel toothbrush and toothpaste storage case cup. Compact square shape, perfect for outdoor camping and trips.',
    price: 87.20,
    discount: 56,
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Bathroom Accessories', slug: 'bathroom-accessories' },
    rating: 4.5,
    stock: 50,
    featured: true,
    trending: false,
    sku: 'TB-TRAVEL',
    brand: 'VKS Marketing'
  },
  {
    _id: 'mock_p5',
    title: 'Multi-functional Hexagon Extension Board',
    slug: 'extension-board',
    description: 'Hexagonal premium power strip extension board with 4 USB charging ports and 4 universal multi-plug outlets. Built-in surge protection spike guard.',
    price: 359.70,
    discount: 28,
    images: ['https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Household Essentials', slug: 'household-essentials' },
    rating: 4.8,
    stock: 30,
    featured: false,
    trending: true,
    sku: 'EB-HEX4',
    brand: 'VKS Marketing'
  },
  {
    _id: 'mock_p6',
    title: 'Airtight Kitchen Storage Container Set',
    slug: 'kitchen-storage-boxes',
    description: 'Modular leakproof dry kitchen storage container boxes. BPA free plastic with airtight vacuum snap locks.',
    price: 1999,
    discount: 30,
    images: ['https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Kitchen & Dining', slug: 'kitchen-dining' },
    rating: 4.9,
    stock: 20,
    featured: true,
    trending: true,
    sku: 'KB-AIRLOCK',
    brand: 'VKS Marketing'
  }
];

const CATEGORIES = [
  { name: 'Kitchen Storage', image: 'https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=400&auto=format&fit=crop', link: '/shop?category=Kitchen' },
  { name: 'Bathroom Accessories', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=400&auto=format&fit=crop', link: '/shop?category=Bathroom' },
  { name: 'Home Organizers', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400&auto=format&fit=crop', link: '/shop?category=Organizers' },
  { name: 'Household Essentials', image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=400&auto=format&fit=crop', link: '/shop' }
];

const TESTIMONIALS = [
  { name: 'Ananya Sharma', comment: 'VKS Marketing storage boxes completely transformed my kitchen! The airtight containers keep things fresh and look so organized.', rating: 5, location: 'New Delhi' },
  { name: 'Rajesh Kumar', comment: 'Heavy duty extension board. The USB-C port charges my iPhone quickly. Outstanding quality, highly recommended.', rating: 5, location: 'Mumbai' },
  { name: 'Pooja Patel', comment: 'The rotating cosmetic organizer fits all my skincare and makeup. Very smooth rotation and thick high-quality plastic.', rating: 4.8, location: 'Ahmedabad' }
];

const FAQ_ITEMS = [
  {
    q: "What is your standard delivery timeline?",
    a: "We ship all orders within 24 hours. For major metro cities in India, delivery takes 2 to 4 business days. For regional districts, it takes 4 to 7 business days. You will receive a tracking link via SMS & email."
  },
  {
    q: "Are the kitchen storage jars microwave-safe?",
    a: "Yes, our modular kitchen storage jars are made from BPA-free, food-grade unbreakable materials. They are fully microwave-safe (without the snap locks/lids) and top-rack dishwasher-safe."
  },
  {
    q: "What is your replacement policy?",
    a: "We offer a 7-day hassle-free replacement policy for all products. If you receive a damaged, defective, or incorrect item, simply raise a replacement request from your dashboard or email support@vksmarketing.com."
  },
  {
    q: "Do you offer cash on delivery (COD)?",
    a: "Yes! We offer cash on delivery across India for all order totals. A nominal COD handling charge of ₹30 may apply. Payment via UPI is free of charge at checkout."
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured'); // featured, best, trending, new
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 35, seconds: 12 });
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const getProductBySlug = (slug, fallbackIndex) => {
    const prod = products.find(p => p.slug === slug);
    return prod || MOCK_PRODUCTS[fallbackIndex];
  };

  const [heroSlides, setHeroSlides] = useState([]);

  useEffect(() => {
    const dbProduct1 = getProductBySlug('kitchen-storage-boxes', 5);
    const dbProduct2 = getProductBySlug('3-in-1-soap-dispenser', 0);
    const dbProduct3 = getProductBySlug('sunglasses-organizer', 1);
    const dbProduct4 = getProductBySlug('extension-board', 4);

    const baseSlides = [
      {
        badge: 'Kitchen Storage',
        title: dbProduct1.title,
        description: dbProduct1.description,
        price: dbProduct1.price,
        discount: dbProduct1.discount,
        image: dbProduct1.images[0],
        slug: dbProduct1.slug,
        actionText: 'Claim Container Set',
        features: ['Airtight Lock', 'BPA Free']
      },
      {
        badge: 'Bathroom Accessories',
        title: dbProduct2.title,
        description: dbProduct2.description,
        price: dbProduct2.price,
        discount: dbProduct2.discount,
        image: dbProduct2.images[0],
        slug: dbProduct2.slug,
        actionText: 'Shop Dispenser',
        features: ['ABS Plastic', 'Leak Proof']
      },
      {
        badge: 'Home Organizers',
        title: dbProduct3.title,
        description: dbProduct3.description,
        price: dbProduct3.price,
        discount: dbProduct3.discount,
        image: dbProduct3.images[0],
        slug: dbProduct3.slug,
        actionText: 'Shop Organizers',
        features: ['Velvet Lining', 'Wall Mounted']
      },
      {
        badge: 'Household Essentials',
        title: dbProduct4.title,
        description: dbProduct4.description,
        price: dbProduct4.price,
        discount: dbProduct4.discount,
        image: dbProduct4.images[0],
        slug: dbProduct4.slug,
        actionText: 'Shop Extension Board',
        features: ['Surge Safe', '4 USB Ports']
      }
    ];

    try {
      const saved = localStorage.getItem('vks_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.heroSlides && parsed.heroSlides.length > 0) {
          const customized = baseSlides.map((slide, idx) => {
            const custom = parsed.heroSlides[idx];
            if (custom) {
              return {
                ...slide,
                badge: custom.badge || slide.badge,
                title: custom.title || slide.title,
                description: custom.description || slide.description,
                actionText: custom.actionText || slide.actionText,
                image: custom.image || slide.image,
                features: custom.features ? custom.features.split(',').map(f => f.trim()) : slide.features
              };
            }
            return slide;
          });
          setHeroSlides(customized);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load customized slides:', e);
    }
    setHeroSlides(baseSlides);
  }, [products]);

  // Hero carousel auto-play slideshow timer
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Flash sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 5, minutes: 0, seconds: 0 }; // Reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await API.get('/products?limit=8');
        if (res.data.success && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else {
          // Fallback to beautiful mock products if database is empty
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.error(err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'featured':
        return products.filter((p) => p.featured);
      case 'trending':
        return products.filter((p) => p.trending);
      case 'new':
        return products.slice(0, 4); // Simulate new arrivals
      case 'deals':
        return products.filter((p) => p.discount >= 15);
      default:
        return products;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0D14] text-[#111827] dark:text-gray-100 min-h-screen selection:bg-primary selection:text-black font-sans transition-colors duration-300">
      
      {/* SECTION 1: HERO SECTION - UNIFIED SLIDESHOW CAROUSEL */}
      <section className="relative pt-32 lg:pt-24 pb-8 lg:pb-12 overflow-hidden bg-white dark:bg-[#0E111A] border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b06_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
        
        {heroSlides.length > 0 && (() => {
          const activeSlide = heroSlides[heroSlideIdx];
          if (!activeSlide) return null;
          const finalPrice = Math.round(activeSlide.price * (1 - (activeSlide.discount || 0) / 100));

          return (
            <div className="w-full flex flex-col justify-between">
              
              {/* Main Slide Grid */}
              <motion.div
                key={heroSlideIdx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full px-8 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20"
              >
                
                {/* Left Column: Slide Text Details */}
                <div className="lg:col-span-7 text-left space-y-6">
                  <span className="inline-flex items-center px-3.5 py-1 bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider text-primary" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {activeSlide.badge}
                  </span>

                  <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900 dark:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {activeSlide.title.split(' ')[0]} <span className="text-primary">{activeSlide.title.split(' ').slice(1).join(' ')}</span>
                  </h1>

                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed font-medium">
                    {activeSlide.description}
                  </p>

                  <div className="flex items-baseline gap-3.5">
                    <span className="text-3xl font-black text-secondary dark:text-white">₹{finalPrice}</span>
                    {activeSlide.discount > 0 && (
                      <>
                        <span className="text-sm text-gray-450 line-through">₹{activeSlide.price}</span>
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-0.5 rounded-md">Save {activeSlide.discount}%</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to={`/product/${activeSlide.slug}`}
                      className="px-8 py-4 bg-primary hover:bg-primary/95 text-black font-black rounded-full shadow-lg shadow-primary/10 transition-all text-xs tracking-widest uppercase"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {activeSlide.actionText}
                    </Link>

                    {/* Manual Navigation Chevrons */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setHeroSlideIdx((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                        }}
                        className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-primary dark:hover:bg-primary text-secondary dark:text-white hover:text-black dark:hover:text-black rounded-full transition-all"
                        aria-label="Previous Slide"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setHeroSlideIdx((prev) => (prev + 1) % heroSlides.length);
                        }}
                        className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-primary dark:hover:bg-primary text-secondary dark:text-white hover:text-black dark:hover:text-black rounded-full transition-all"
                        aria-label="Next Slide"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Premium Active Product Image Frame */}
                <div className="lg:col-span-5 flex justify-center items-center select-none">
                  <div className="w-full max-w-[360px] aspect-square rounded-[36px] bg-gray-50/70 dark:bg-black/25 p-6 flex items-center justify-center border border-gray-150 dark:border-white/5 shadow-inner transition-colors duration-300 relative group overflow-visible">
                    <img
                      src={activeSlide.image}
                      alt={activeSlide.title}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md hover:scale-103 transition-transform duration-500"
                    />

                    {/* Floating Badge 1 (Top Left) */}
                    <div
                      className="absolute -top-3 -left-3 px-3 py-1.5 bg-white/90 dark:bg-[#131722]/90 backdrop-blur-sm border border-gray-150 dark:border-white/5 rounded-full shadow-md text-[9px] font-black text-gray-700 dark:text-gray-300 flex items-center gap-1 select-none animate-bounce"
                      style={{ animationDuration: '3.5s', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {activeSlide.features?.[0] || 'Premium'}
                    </div>

                    {/* Floating Badge 2 (Bottom Right) */}
                    <div
                      className="absolute -bottom-3 -right-3 px-3 py-1.5 bg-white/90 dark:bg-[#131722]/90 backdrop-blur-sm border border-gray-150 dark:border-white/5 rounded-full shadow-md text-[9px] font-black text-gray-700 dark:text-gray-300 flex items-center gap-1 select-none animate-bounce"
                      style={{ animationDuration: '4.5s', fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {activeSlide.features?.[1] || 'Utility'}
                    </div>
                  </div>
                </div>

              </motion.div>

              {/* Slider Bottom Dot Indicators */}
              <div className="flex justify-center gap-2 pt-6">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlideIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === heroSlideIdx
                        ? 'bg-primary w-4'
                        : 'bg-gray-200 dark:bg-white/10'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          );
        })()}
      </section>

      {/* SECTION 2: BENEFIT STRIP */}
      <section className="bg-gray-50/30 dark:bg-[#0A0D14] py-10 border-b border-gray-200/60 dark:border-white/5 transition-colors duration-300">
        <div className="w-full px-8 md:px-16 lg:px-24 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: <FiTruck />, title: 'Fast Delivery', desc: 'Shipped within 24 hours across India' },
            { icon: <FiShield />, title: 'Premium ABS Plastic', desc: 'Food-grade unbreakable material' },
            { icon: <FiAward />, title: 'Patron Choice', desc: 'Loved by thousands of households' },
            { icon: <FiClock />, title: '7-Day Replacement', desc: 'Easy and hassle-free returns' }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/5 flex items-center justify-center text-primary text-base flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</h4>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CLUTTER QUIZ CALL-TO-ACTION BANNER */}
      <section className="py-6 bg-white dark:bg-[#0A0D14] transition-colors duration-300 w-full px-8 md:px-16 lg:px-24 select-none">
        <div className="relative bg-gradient-to-r from-primary to-orange-500 rounded-[32px] p-8 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-primary/5 overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] pointer-events-none" />
          <div className="text-left space-y-2 z-10 relative">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 bg-white/20 px-2.5 py-0.5 rounded-full">Struggling with storage?</span>
            <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Find the Perfect Organizer in 3 Steps</h2>
            <p className="text-xs text-black/75 max-w-lg leading-relaxed font-semibold">Answer 3 simple questions about your clutter area and our wizard concierge will select the matching utility product instantly.</p>
          </div>
          <button
            onClick={() => setIsQuizOpen(true)}
            className="px-8 py-4 bg-black text-white hover:bg-black/90 font-black rounded-full shadow-lg transition-all text-xs tracking-widest uppercase flex-shrink-0 z-10 hover:shadow-black/20"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Launch Quiz Wizard
          </button>
        </div>
      </section>

      {/* SECTION 3: SHOP BY COLLECTION */}
      <section className="py-16 bg-white dark:bg-[#0E111A] border-b border-gray-150 dark:border-white/5 w-full px-8 md:px-16 lg:px-24 transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 text-left">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>House Collections</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Shop by Category</h2>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mt-3 md:mt-0 leading-relaxed font-semibold">
            Explore functional essentials carefully grouped by room aesthetics and utility requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              key={cat.name}
              className="relative h-[300px] rounded-[28px] overflow-hidden group shadow-sm cursor-pointer border border-gray-100 dark:border-white/5 transition-all duration-300"
              onClick={() => navigate(cat.link)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              <div className="absolute bottom-6 left-6 right-6 z-20 text-left text-white flex justify-between items-end">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-lg tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>{cat.name}</h3>
                  <p className="text-[9px] text-primary font-bold tracking-wider uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Explore Range</p>
                </div>
                <span className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                  <FiArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4: LIMITED FLASH DEALS - STAR DEAL BANNER */}
      <section className="bg-[#F2F4F7] dark:bg-[#0A0D14] py-16 border-b border-gray-200 dark:border-white/5 transition-colors duration-300 w-full px-8 md:px-16 lg:px-24">
        
        {/* Symmetrical Header */}
        <div className="text-center mb-12 space-y-2.5">
          <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Spotlight Offer</p>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Limited Flash Sales</h2>
        </div>

        {/* Hero Deal Card */}
        <div className="bg-white dark:bg-[#131722] border border-gray-200/60 dark:border-white/5 rounded-[36px] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_25px_60px_rgba(0,0,0,0.035)] transition-colors duration-300 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Deal Details & Action */}
          <div className="w-full lg:w-3/5 text-left space-y-6 relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              Save 30% Today
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              3-in-1 Kitchen Soap Dispenser Set
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl font-medium">
              Made from premium food-grade unbreakable material. Holds up to 13oz of soap, keeping your kitchen sink organized, dry, and free of clutter. Features a responsive one-hand press sponge tray.
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-secondary dark:text-white">₹249</span>
              <span className="text-sm text-gray-450 dark:text-gray-500 line-through">₹350</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Limited Promo</span>
            </div>

            {/* Countdown timers */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="flex gap-2.5 select-none">
                <div className="bg-gray-50 dark:bg-[#0A0D14] border border-gray-200 dark:border-white/5 rounded-xl p-3 w-14 text-center transition-colors duration-300">
                  <span className="text-base font-bold text-primary block tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Hrs</span>
                </div>
                <span className="text-xl text-primary self-center font-light">:</span>
                <div className="bg-gray-50 dark:bg-[#0A0D14] border border-gray-200 dark:border-white/5 rounded-xl p-3 w-14 text-center transition-colors duration-300">
                  <span className="text-base font-bold text-primary block tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-[8px] text-gray-405 font-bold uppercase tracking-wider">Min</span>
                </div>
                <span className="text-xl text-primary self-center font-light">:</span>
                <div className="bg-gray-50 dark:bg-[#0A0D14] border border-gray-200 dark:border-white/5 rounded-xl p-3 w-14 text-center transition-colors duration-300">
                  <span className="text-base font-bold text-primary block tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{countdown.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-[8px] text-gray-405 font-bold uppercase tracking-wider">Sec</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Remaining Slots</p>
            </div>

            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    const res = await API.post('/cart/add', {
                      productId: products[0]?._id || 'mock_p1',
                      quantity: 1,
                      color: products[0]?.color?.[0] || '',
                      size: products[0]?.size?.[0] || ''
                    });
                    if (res.data.success) {
                      showToast('Flash sale item added to cart!', 'success');
                    }
                  } catch (error) {
                    showToast('Please login to checkout this flash deal', 'warning');
                  }
                }}
                className="px-8 py-4 bg-primary hover:bg-primary/95 text-black font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-md shadow-primary/10"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Claim Deal & Add to Cart
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Product Image Container */}
          <div className="w-full lg:w-5/12 flex justify-center relative">
            <div className="relative w-full max-w-[420px] aspect-square rounded-[32px] overflow-hidden bg-black/[0.01] dark:bg-black/20 p-2 flex items-center justify-center border border-gray-150 dark:border-white/5 transition-colors duration-300">
              <img
                src="https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop"
                alt="3 in 1 Soap Dispenser"
                className="w-full h-full object-contain rounded-2xl filter drop-shadow-md hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-black/90 backdrop-blur-sm border dark:border-white/5 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm select-none">
                <FiStar className="text-primary fill-current w-3 h-3" />
                <span className="text-[10px] font-bold text-gray-800 dark:text-white">4.9</span>
                <span className="text-[9px] text-gray-400">(420+ Orders)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: TABS COLLECTIONS */}
      <section className="py-16 bg-white dark:bg-[#0E111A] border-b border-gray-150 dark:border-white/5 w-full px-8 md:px-16 lg:px-24 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-gray-100 dark:border-white/5 pb-8 mb-12 text-left">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VKS Catalog</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Featured Products</h2>
          </div>

          {/* Elegant tab switches in a floating capsule container */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100/60 dark:bg-[#131722]/80 border border-gray-200/50 dark:border-white/5 p-1.5 rounded-full shadow-inner transition-colors duration-300">
            {[
              { id: 'featured', label: 'Featured Series' },
              { id: 'trending', label: 'Trending Series' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'deals', label: 'Spotlight Deals' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-secondary text-white dark:bg-primary dark:text-black shadow-md font-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content list - balanced 4-column grid (up to 8 products) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {getFilteredProducts().slice(0, 8).map((prod) => (
              <motion.div
                key={prod._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <ProductCard product={prod} />
              </motion.div>
            ))}
          </div>
        )}
      </section>



      {/* SECTION 7: TESTIMONIALS */}
      <section className="hidden md:block py-16 bg-white dark:bg-[#0E111A] border-b border-gray-200/50 dark:border-white/5 w-full px-8 md:px-16 lg:px-24 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 space-y-2"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Verified Patrons</p>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Shared Experiences</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              key={i}
              className="bg-white dark:bg-[#131722] border border-gray-150 dark:border-white/5 rounded-[28px] p-6 flex flex-col text-left shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] h-full border-b-2 border-b-transparent hover:border-b-primary transition-all duration-300"
            >
              <div className="flex text-primary mb-4">
                {[...Array(5)].map((_, idx) => (
                  <FiStar key={idx} className="fill-current w-3 h-3" />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed italic mb-6 flex-grow">
                "{t.comment}"
              </p>
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-white/5 pt-4">
                <span className="font-extrabold text-xs text-gray-800 dark:text-gray-200" style={{ fontFamily: "'Outfit', sans-serif" }}>{t.name}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{t.location}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 7.5: FAQ ACCORDION */}
      <section className="py-16 bg-gray-50/40 dark:bg-[#0A0D14] border-b border-gray-150 dark:border-white/5 w-full px-8 md:px-16 lg:px-24 transition-colors duration-300">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Got Questions?</p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#131722] border border-gray-250 dark:border-white/5 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {faq.q}
                    </span>
                    <span className="text-primary text-base font-medium pl-4">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="px-6 pb-5 pt-1 border-t border-gray-100 dark:border-white/5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: PRE-FOOTER VIP NEWSLETTER POD */}
      <section className="w-full px-8 md:px-16 lg:px-24 py-16 bg-white dark:bg-[#0A0D14] border-b border-gray-150 dark:border-white/5 transition-colors duration-300 select-none">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-[#131722] border border-gray-150 dark:border-white/5 rounded-[28px] p-6 md:p-12 overflow-hidden shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors duration-300"
        >
          {/* Subtle Orange Decorative Underlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className="text-left space-y-2.5 max-w-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3.5 py-1 rounded-full" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Secure VIP Access</span>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Join the VKS Newsletter</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed font-semibold">
              Subscribe for exclusive weekly catalog updates, restock alerts, and get 15% off your next checkout.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); showToast('Subscribed successfully!', 'success'); }} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="flex-grow px-5 py-3.5 bg-gray-50 dark:bg-[#0A0D14] border border-gray-200/80 dark:border-white/5 rounded-full text-xs text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-550 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-black font-black rounded-full text-xs uppercase tracking-wider transition-all"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>

      {/* SECTION 9: VISUAL CHRONICLES */}
      <section className="hidden md:block py-16 bg-white dark:bg-[#0E111A] select-none transition-colors duration-300">
        <div className="text-center mb-12 space-y-2">
          <p className="text-xs font-bold text-primary uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Visual Chronicles</p>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>#VKSMarketingHome</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mx-auto leading-relaxed mt-2 font-semibold">
            Follow VKS Studio for organization blueprints, styling guides, and space curations.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 px-8 md:px-16 lg:px-24 w-full">
          {[
            'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=300&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=300&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=300&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=300&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=300&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1595231712426-63d23a9ae100?q=80&w=300&auto=format&fit=crop'
          ].map((url, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -4 }}
              className="aspect-square overflow-hidden rounded-[20px] border border-gray-150 dark:border-white/5 shadow-sm relative group cursor-pointer transition-all duration-300"
            >
              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-black text-[9px] font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                View Post
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommendations Quiz Wizard Overlay */}
      <OrganizerQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />

    </div>
  );
};

export default Home;
