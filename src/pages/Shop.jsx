import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiSliders, FiX, FiSearch, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { setCart } from '../redux/cartSlice.js';
import { addToCompare } from '../components/CompareDrawer.jsx';
import { ProductCardSkeleton } from '../components/LoadingSkeleton.jsx';
import API from '../services/api.js';

const MOCK_PRODUCTS = [
  {
    _id: 'mock_p1',
    title: '3 in 1 Soap Dispenser with Sponge Holder',
    slug: '3-in-1-soap-dispenser',
    description: 'Unbreakable 3-in-1 kitchen hand wash & dish soap dispenser with integrated sponge holder slot. Keeps counters clean and clutter-free.',
    price: 249,
    discount: 20,
    images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop'],
    category: { name: 'Kitchen & Dining', slug: 'kitchen-dining', _id: 'mock_cat_kd' },
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
    category: { name: 'Home Organizers', slug: 'home-organizers', _id: 'mock_cat_ho' },
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
    category: { name: 'Home Organizers', slug: 'home-organizers', _id: 'mock_cat_ho' },
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
    category: { name: 'Bathroom Accessories', slug: 'bathroom-accessories', _id: 'mock_cat_ba' },
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
    category: { name: 'Household Essentials', slug: 'household-essentials', _id: 'mock_cat_he' },
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
    category: { name: 'Kitchen & Dining', slug: 'kitchen-dining', _id: 'mock_cat_kd' },
    rating: 4.9,
    stock: 20,
    featured: true,
    trending: true,
    sku: 'KB-AIRLOCK',
    brand: 'VKS Marketing'
  }
];


const MOCK_CATEGORIES = [
  { _id: 'mock_cat_kd', name: 'Kitchen & Dining', slug: 'kitchen-dining' },
  { _id: 'mock_cat_ba', name: 'Bathroom Accessories', slug: 'bathroom-accessories' },
  { _id: 'mock_cat_ho', name: 'Home Organizers', slug: 'home-organizers' },
  { _id: 'mock_cat_he', name: 'Household Essentials', slug: 'household-essentials' }
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const categoriesFromStore = useSelector((state) => state.products.categories);
  const categoriesList = categoriesFromStore.length > 0 ? categoriesFromStore : MOCK_CATEGORIES;

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  
  // Products Loading State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync state filters with URL query parameters
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    const catQuery = searchParams.get('category') || '';
    
    // Resolve matching category ID if a slug/name was passed in URL query
    if (catQuery) {
      const match = categoriesList.find(
        (c) => c.slug === catQuery || c.name.toLowerCase().includes(catQuery.toLowerCase())
      );
      setSelectedCategory(match ? match._id : '');
    } else {
      setSelectedCategory('');
    }
  }, [searchParams, categoriesList]);

  // Fetch filtered products list
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        let url = `/products?page=${currentPage}&limit=9`;
        
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (minRating) url += `&rating=${minRating}`;
        if (inStockOnly) url += `&availability=true`;
        if (sortOption) {
          if (sortOption === 'priceAsc') url += `&sort=priceAsc`;
          else if (sortOption === 'priceDesc') url += `&sort=priceDesc`;
          else if (sortOption === 'rating') url += `&sort=ratingDesc`;
          else if (sortOption === 'trending') url += `&sort=trending`;
        }

        const res = await API.get(url);
        if (res.data.success && res.data.products.length > 0) {
          setProducts(res.data.products);
          setTotalPages(res.data.pages);
        } else {
          // Perform manual filtering over mock dataset in development
          let filtered = [...MOCK_PRODUCTS];
          if (searchQuery) {
            filtered = filtered.filter(
              (p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          if (selectedCategory) {
            filtered = filtered.filter((p) => p.category._id === selectedCategory);
          }
          if (minPrice) {
            filtered = filtered.filter((p) => p.price * (1 - p.discount / 100) >= parseFloat(minPrice));
          }
          if (maxPrice) {
            filtered = filtered.filter((p) => p.price * (1 - p.discount / 100) <= parseFloat(maxPrice));
          }
          if (minRating) {
            filtered = filtered.filter((p) => p.rating >= parseFloat(minRating));
          }
          if (inStockOnly) {
            filtered = filtered.filter((p) => p.stock > 0);
          }
          if (sortOption === 'priceAsc') {
            filtered.sort((a, b) => (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100)));
          } else if (sortOption === 'priceDesc') {
            filtered.sort((a, b) => (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100)));
          } else if (sortOption === 'rating') {
            filtered.sort((a, b) => b.rating - a.rating);
          }

          setProducts(filtered);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed loading products page:', error);
        setProducts(MOCK_PRODUCTS);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [currentPage, searchQuery, selectedCategory, minPrice, maxPrice, minRating, inStockOnly, sortOption]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setSortOption('newest');
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'warning');
      return;
    }
    try {
      const res = await API.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        color: product.color?.[0] || '',
        size: product.size?.[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Added to cart successfully!', 'success');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <div className="w-full px-8 md:px-12 py-8 transition-all duration-300">
      {/* Breadcrumb Header */}
      <div className="text-left mb-8 select-none">
        <h1 className="text-3xl font-black text-secondary dark:text-white mb-2">Shop Collection</h1>
        <p className="text-sm text-customGray font-medium">Browse our premium kitchen storage and home organizers.</p>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block w-64 flex-shrink-0 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm sticky top-28 text-left select-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base flex items-center gap-2"><FiSliders /> Filters</h3>
            <button onClick={handleClearFilters} className="text-xs text-primary font-bold hover:underline">Clear All</button>
          </div>

          {/* Search Box */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keywords..."
                className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-3 pl-8 focus:outline-none focus:border-primary/50"
              />
              <FiSearch className="absolute left-2.5 top-3 text-customGray w-3.5 h-3.5" />
            </div>
          </div>

          {/* Categories select */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Categories</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categoriesList.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range inputs */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Price (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-2.5 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-2.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Minimum rating */}
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none"
            >
              <option value="">Any Rating</option>
              <option value="4">4.0 ★ & Above</option>
              <option value="4.5">4.5 ★ & Above</option>
              <option value="3">3.0 ★ & Above</option>
            </select>
          </div>

          {/* Stock filter */}
          <div className="flex items-center gap-2 mb-2 select-none">
            <input
              type="checkbox"
              id="stock_check"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-primary rounded"
            />
            <label htmlFor="stock_check" className="text-sm font-semibold cursor-pointer">In Stock Only</label>
          </div>
        </aside>

        {/* PRODUCTS CATALOG VIEW */}
        <div className="flex-grow">
          
          {/* Sorting / Results Top bar */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-4 shadow-sm mb-6 flex justify-between items-center gap-4">
            <div className="text-sm text-customGray font-semibold select-none">
              Showing {products.length} Products
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-customGray hidden sm:block">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-1.5 px-3 focus:outline-none"
              >
                <option value="newest">New Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="trending">Best Sellers</option>
              </select>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden p-2 bg-customGray-light dark:bg-black/30 rounded-xl hover:bg-primary transition-colors hover:text-black"
              >
                <FiSliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Products Card Grid - Responsive 3 columns in one row */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#131722] border border-gray-150 dark:border-white/5 rounded-[32px] p-6 h-[450px] animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((prod) => {
                const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));
                return (
                  <motion.div
                    key={prod._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/5 rounded-[32px] p-5 flex flex-col justify-between relative shadow-[0_12px_35px_rgba(139,92,26,0.025)] hover:shadow-[0_22px_48px_rgba(245,158,11,0.09)] hover:-translate-y-2 transition-all duration-500 group text-left h-[460px] overflow-visible"
                  >
                    {/* Product Image Frame */}
                    <div className="w-full h-48 bg-[#F5F5F3] dark:bg-black/25 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden group">
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                      />
                      {prod.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-2.5 rounded-full shadow-sm">
                          {prod.discount}% Off
                        </span>
                      )}
                    </div>
 
                    {/* Product details */}
                    <div className="space-y-1.5 mt-4 flex-grow">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                          {typeof prod.category === 'object' ? prod.category.name : 'Essentials'}
                        </span>
                        <span className="text-[10px] text-yellow-500 font-extrabold flex items-center gap-0.5">
                          ★ {prod.rating ? prod.rating.toFixed(1) : '5.0'}
                        </span>
                      </div>
 
                      <Link to={`/product/${prod.slug}`}>
                        <h3
                          className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white line-clamp-1 leading-snug hover:text-primary transition-colors mt-1"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {prod.title}
                        </h3>
                      </Link>
 
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
 
                      <div className="flex items-baseline gap-2.5 pt-1">
                        <span className="text-lg font-black text-secondary dark:text-white">₹{finalPrice}</span>
                        {prod.discount > 0 && (
                          <>
                            <span className="text-xs text-gray-450 line-through">₹{prod.price}</span>
                            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Save {prod.discount}%</span>
                          </>
                        )}
                      </div>
                    </div>
 
                    {/* Button Action row */}
                    <div className="flex gap-1.5 items-center mt-5 pt-3 border-t border-gray-100 dark:border-white/5 w-full">
                      <button
                        onClick={() => addToCompare(prod, showToast)}
                        className="px-2.5 py-2.5 border border-gray-250 dark:border-white/10 text-secondary dark:text-white hover:bg-primary hover:text-black rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all"
                        title="Add to Compare"
                      >
                        Compare
                      </button>
                      <Link
                        to={`/product/${prod.slug}`}
                        className="flex-grow text-center py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-secondary dark:text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Details
                      </Link>
                      {prod.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="flex-grow py-3 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md shadow-primary/10 hover:shadow-primary/20"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          Add
                        </button>
                      ) : (
                        <span className="flex-grow py-3 bg-red-500/10 text-red-500 font-black rounded-xl text-[10px] uppercase tracking-widest text-center border border-red-500/20">
                          Sold
                        </span>
                      )}
                    </div>
 
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-customGray-dark rounded-3xl border border-customGray-light dark:border-white/5 shadow-sm select-none">
              <p className="text-customGray font-semibold text-lg mb-4">No products found matching your search filters.</p>
              <button onClick={handleClearFilters} className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl transition-all shadow">
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10 select-none">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-semibold border rounded-xl disabled:opacity-50 hover:bg-primary hover:text-black transition-colors"
              >
                Prev
              </button>
              <span className="text-sm font-semibold px-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-semibold border rounded-xl disabled:opacity-50 hover:bg-primary hover:text-black transition-colors"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MOBILE DRAWER FILTERS */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <div onClick={() => setIsMobileFiltersOpen(false)} className="absolute inset-0 bg-black/60" />
          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-customGray-dark p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><FiSliders /> Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-customGray-light dark:hover:bg-black/30">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Same Filter contents inside mobile drawer */}
            <div className="text-left select-none space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keywords..."
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Categories</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Price (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-2.5 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2 px-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Min Rating</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full text-sm bg-customGray-light dark:bg-black/30 border border-transparent rounded-xl py-2.5 px-3 focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0 ★ & Above</option>
                  <option value="4.5">4.5 ★ & Above</option>
                  <option value="3">3.0 ★ & Above</option>
                </select>
              </div>

              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="stock_check_mob"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-primary rounded"
                />
                <label htmlFor="stock_check_mob" className="text-sm font-semibold cursor-pointer">In Stock Only</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleClearFilters}
                  className="w-1/2 py-2.5 border border-customGray rounded-xl text-sm font-semibold"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-1/2 py-2.5 bg-primary text-black rounded-xl text-sm font-bold shadow"
                >
                  Apply Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
