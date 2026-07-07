import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { selectCartItemsCount } from '../redux/cartSlice.js';
import { logout } from '../redux/authSlice.js';
import { clearCartState } from '../redux/cartSlice.js';
import { clearWishlistState } from '../redux/wishlistSlice.js';
import SpinToWin from '../components/SpinToWin.jsx';
import CompareDrawer from '../components/CompareDrawer.jsx';
import SpaceConcierge from '../components/SpaceConcierge.jsx';
import MiniCart from '../components/MiniCart.jsx';
import API from '../services/api.js';
import { playClickSound } from '../utils/audio.js';

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [mobileMuted, setMobileMuted] = useState(localStorage.getItem('vks_mute_sounds') === 'true');

  const toggleMobileMute = () => {
    const nextVal = !mobileMuted;
    setMobileMuted(nextVal);
    localStorage.setItem('vks_mute_sounds', nextVal ? 'true' : 'false');
    window.dispatchEvent(new Event('vks_audio_mute_toggle'));
  };

  useEffect(() => {
    const handleToggle = () => {
      setMobileMuted(localStorage.getItem('vks_mute_sounds') === 'true');
    };
    window.addEventListener('vks_audio_mute_toggle', handleToggle);
    return () => window.removeEventListener('vks_audio_mute_toggle', handleToggle);
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });
  
  const searchRef = useRef(null);
  const profileRef = useRef(null);



  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const wishlistCount = wishlistProducts.length;
  const categories = useSelector((state) => state.products.categories);

  const [siteSettings, setSiteSettings] = useState({
    phone: '+91 98765 43210',
    email: 'info@vksmarketing.com',
    announcement: 'Upgrade your home with quality products at affordable prices.',
    address: 'Sector 63, Noida, UP, India'
  });

  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnnouncementIdx((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vks_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSiteSettings({
          phone: parsed.phone || '+91 98765 43210',
          email: parsed.email || 'info@vksmarketing.com',
          announcement: parsed.announcement || 'Upgrade your home with quality products at affordable prices.',
          address: parsed.address || 'Sector 63, Noida, UP, India'
        });
      }
    } catch (e) {
      console.error('Failed loading site settings:', e);
    }
  }, [location.pathname]);



  // Shrink navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for search suggestions & profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions([]);
        return;
      }
      try {
        const res = await API.get(`/products?search=${searchQuery}&limit=5`);
        if (res.data.success) {
          setSearchSuggestions(res.data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const res = await API.post('/newsletter/subscribe', { email: newsletterEmail });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setNewsletterEmail('');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const megaMenuLinks = {
    'Kitchen & Dining': [
      { name: 'Soap Dispenser', slug: 'soap-dispenser' },
      { name: 'Kitchen Storage Boxes', slug: 'kitchen-storage-boxes' },
      { name: 'Plastic Household Products', slug: 'plastic-household-products' }
    ],
    'Home Organizers': [
      { name: 'Toothbrush Holder', slug: 'toothbrush-holder' },
      { name: 'Sunglasses Organizer', slug: 'sunglasses-organizer' },
      { name: 'Cosmetic Organizer', slug: 'cosmetic-organizer' },
      { name: 'Home Organizers', slug: 'home-organizers' }
    ],
    'Bathroom & Travel': [
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories' },
      { name: 'Travel Accessories', slug: 'travel-accessories' },
      { name: 'Extension Board', slug: 'extension-board' }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[9999] origin-[0%]"
        style={{ scaleX }}
      />
      
      {/* Top Banner Contact Bar */}
      <div className="bg-secondary text-white text-xs py-2 px-4 flex justify-between items-center border-b border-white/10 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><FiPhone className="text-primary" /> {siteSettings.phone}</span>
          <span className="flex items-center gap-1"><FiMail className="text-primary" /> {siteSettings.email}</span>
        </div>
        <div className="hidden sm:block text-primary font-bold tracking-wide h-4 overflow-hidden relative w-96 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeAnnouncementIdx}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 block truncate text-center text-primary"
            >
              {activeAnnouncementIdx === 0 ? siteSettings.announcement :
               activeAnnouncementIdx === 1 ? '✨ Free Shipping across India on orders above ₹500' :
               activeAnnouncementIdx === 2 ? '🎁 Spin the Lucky Wheel for discount codes!' :
               '⚡ Cash on Delivery (COD) available nationwide.'}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Capsule Main Navbar */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 max-w-7xl w-[95%] rounded-full border transition-all duration-500 ${
          isScrolled
            ? 'top-4 py-2 px-6 bg-white/95 dark:bg-[#121212]/95 border-primary/20 shadow-[0_20px_50px_rgba(255,107,0,0.12)] backdrop-blur-xl'
            : 'top-10 py-3.5 px-8 bg-white/95 dark:bg-[#181818]/95 border-white/5 shadow-2xl backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-orange-500 hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center">
              <img src="/media__1782796237116.jpg" alt="VKS Marketing" className="h-9 sm:h-10 object-contain rounded-full border border-white/10" />
            </div>
          </Link>

          {/* Search Bar - Center */}
          <div ref={searchRef} className="hidden lg:block relative max-w-md w-full">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center bg-customGray-light dark:bg-customGray-dark rounded-full border border-transparent focus-within:border-primary/50 focus-within:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300">
                <input
                  type="text"
                  placeholder="Search premium household essentials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-transparent text-secondary dark:text-white pl-4 pr-10 py-2.5 rounded-full text-xs focus:outline-none"
                />
                <button type="submit" className="absolute right-3.5 text-customGray hover:text-primary transition-colors">
                  <FiSearch className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Search suggestions dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 mt-2 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-2xl shadow-xl overflow-hidden z-[100]"
                >
                  <div className="py-2 text-xs font-semibold px-4 text-customGray border-b border-customGray-light dark:border-white/5 bg-customGray-light/40 dark:bg-black/40">
                    Product Suggestions
                  </div>
                  {searchSuggestions.map((prod) => (
                    <Link
                      key={prod._id}
                      to={`/product/${prod.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-customGray-light dark:hover:bg-black/40 transition-colors"
                    >
                      <img src={prod.images[0]} alt={prod.title} className="w-10 h-10 object-cover rounded-lg bg-white" />
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold text-secondary dark:text-white truncate">{prod.title}</h4>
                        <p className="text-xs text-primary font-medium">₹{prod.price * (1 - prod.discount / 100)}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation Links (Pill Style) */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-primary text-black shadow-md'
                  : 'text-secondary dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            
            {/* Mega Menu Toggle */}
            <div
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 focus:outline-none ${
                  isMegaMenuOpen
                    ? 'bg-primary text-black shadow-md'
                    : 'text-secondary dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Shop Essentials <FiChevronDown className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              {/* Mega Menu Overlay */}
              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -left-48 mt-2 w-[600px] bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl shadow-2xl p-6 grid grid-cols-3 gap-6 z-[100] glassmorphism"
                  >
                    {Object.entries(megaMenuLinks).map(([title, links]) => (
                      <div key={title}>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-customGray mb-3 border-b border-customGray-light dark:border-white/5 pb-1">
                          {title}
                        </h3>
                        <ul className="flex flex-col gap-2">
                          {links.map((link) => (
                            <li key={link.slug}>
                              <Link
                                to={`/shop?search=${encodeURIComponent(link.name)}`}
                                onClick={() => setIsMegaMenuOpen(false)}
                                className="text-sm text-secondary dark:text-gray-300 hover:text-primary transition-colors font-normal block py-0.5"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/shop"
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                location.pathname === '/shop'
                  ? 'bg-primary text-black shadow-md'
                  : 'text-secondary dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              All Products
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                location.pathname === '/contact'
                  ? 'bg-primary text-black shadow-md'
                  : 'text-secondary dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Action Icons (Wishlist, Cart, Profile, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-primary hover:text-black hover:border-primary dark:hover:bg-primary dark:hover:text-black dark:hover:border-primary transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.2)] text-secondary dark:text-white"
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-full bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-primary hover:text-black hover:border-primary dark:hover:bg-primary dark:hover:text-black dark:hover:border-primary transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.2)] text-secondary dark:text-white relative"
            >
              <FiHeart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 rounded-full bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-primary hover:text-black hover:border-primary dark:hover:bg-primary dark:hover:text-black dark:hover:border-primary transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.2)] text-secondary dark:text-white relative"
            >
              <FiShoppingCart className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-black">
                  {cartItemsCount                }
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1 p-2.5 bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-primary hover:text-black hover:border-primary dark:hover:bg-primary dark:hover:text-black dark:hover:border-primary transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.2)] rounded-full text-secondary dark:text-white"
                  >
                    <FiUser className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-2xl shadow-xl overflow-hidden z-[100]"
                      >
                        <div className="px-4 py-2.5 border-b border-customGray-light dark:border-white/5">
                          <p className="text-xs text-customGray">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-secondary dark:text-white">{user?.name}</p>
                        </div>
                        <Link
                          to="/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-secondary dark:text-gray-200 hover:bg-customGray-light dark:hover:bg-black/35 transition-colors"
                        >
                          Order History
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-secondary dark:text-gray-200 hover:bg-customGray-light dark:hover:bg-black/35 transition-colors"
                        >
                          My Addresses
                        </Link>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-customGray-light dark:hover:bg-black/35 transition-colors"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 p-2.5 sm:px-5 sm:py-2.5 bg-primary hover:bg-primary/95 text-black rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.25)]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <FiUser className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-primary hover:text-black hover:border-primary dark:hover:bg-primary dark:hover:text-black dark:hover:border-primary rounded-full text-secondary dark:text-white transition-all duration-300 hover:shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
            >
              <FiMenu className="w-4 h-4" />
            </button>

          </div>

        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-customGray-dark shadow-2xl z-50 p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-customGray-light dark:border-white/5 pb-4 flex-shrink-0">
                <span className="font-extrabold text-xl tracking-wider text-secondary dark:text-white">
                  VKS<span className="text-primary font-medium">Marketing</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-customGray hover:bg-customGray-light dark:hover:bg-black/30"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/40 text-secondary dark:text-white pl-4 pr-10 py-2 rounded-full text-sm border border-transparent focus:outline-none"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-customGray">
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>

              {/* Scrollable Links Area */}
              <div className="flex-grow overflow-y-auto pr-1 space-y-5">
                
                {/* Main Links */}
                <div className="flex flex-col gap-3.5 text-sm font-black select-none text-left">
                  <Link to="/" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary block py-2 border-b border-customGray-light dark:border-white/5 uppercase tracking-wider">Home</Link>
                  
                  {/* Collapsible Shop Categories Accordion */}
                  <div className="border-b border-customGray-light dark:border-white/5 py-1">
                    <button
                      onClick={() => { setIsMobileCategoriesOpen(!isMobileCategoriesOpen); playClickSound(); }}
                      className="w-full flex justify-between items-center py-2 text-secondary dark:text-white hover:text-primary uppercase tracking-wider font-black focus:outline-none"
                    >
                      <span>Shop by Collection</span>
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMobileCategoriesOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isMobileCategoriesOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="pl-3 py-1 flex flex-col gap-2.5 border-l border-primary/20 mt-1 mb-2 font-bold text-xs"
                        >
                          <Link to="/shop?category=kitchen-dining" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="text-secondary dark:text-gray-300 hover:text-primary block py-1">Kitchen Storage</Link>
                          <Link to="/shop?category=home-organizers" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="text-secondary dark:text-gray-300 hover:text-primary block py-1">Home Organizing</Link>
                          <Link to="/shop?category=household-essentials" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="text-secondary dark:text-gray-300 hover:text-primary block py-1">Tech Utilities</Link>
                          <Link to="/shop" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="text-primary hover:underline block py-1">Browse All Products</Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Link to="/contact" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary block py-2 border-b border-customGray-light dark:border-white/5 uppercase tracking-wider">Contact Us</Link>
                </div>

                {/* Policies & Support */}
                <div className="space-y-2 text-left select-none pt-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-customGray">Support & Policies</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-customGray">
                    <Link to="/orders" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary py-1 block">Track Order</Link>
                    <Link to="/shipping-policy" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary py-1 block">Shipping Care</Link>
                    <Link to="/refund-policy" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary py-1 block">Returns Policy</Link>
                    <Link to="/privacy-policy" onClick={() => { setIsMobileMenuOpen(false); playClickSound(); }} className="hover:text-primary py-1 block">Privacy Policy</Link>
                  </div>
                </div>

                {/* Preferences Controller Dashboard Panel */}
                <div className="p-4 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-white/5 rounded-2xl space-y-3 select-none text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-customGray block">App Preferences</span>

                  {/* Audio toggler */}
                  <div className="flex justify-between items-center text-xs font-bold text-secondary dark:text-white">
                    <span className="flex items-center gap-1.5">{mobileMuted ? <FiVolumeX className="w-3.5 h-3.5 text-red-400" /> : <FiVolume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />} Feedback Chimes</span>
                    <button
                      onClick={toggleMobileMute}
                      className="px-3 py-1 bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 rounded-lg border dark:border-white/10 text-[10px] font-black uppercase transition-all"
                    >
                      {mobileMuted ? 'Muted' : 'Active'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Footer CTA */}
              <div className="flex-shrink-0 flex flex-col gap-4 border-t border-customGray-light dark:border-white/5 pt-4 mt-auto">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-red-500 text-white rounded-xl font-semibold text-center text-sm shadow hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl font-semibold text-center text-sm shadow hover:bg-secondary/95 dark:hover:bg-primary/95 transition-all"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow pt-24 pb-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-gray-300 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/5 pb-12 mb-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 select-none">
              <img src="/media__1782796237116.jpg" alt="VKS Marketing" className="h-10 object-contain rounded-lg border border-white/5" />
            </div>
            <p className="text-sm text-customGray leading-6">
              VKS Marketing brings premium quality Kitchen & Household Storage Boxes, Bathroom Accessories, Organizer trays, Travel supplies, and utilities right to your doorstep.
            </p>
            <div className="flex flex-col gap-2 mt-2 text-sm">
              <span className="flex items-center gap-2"><FiMapPin className="text-primary" /> {siteSettings.address}</span>
              <span className="flex items-center gap-2"><FiPhone className="text-primary" /> {siteSettings.phone}</span>
              <span className="flex items-center gap-2"><FiMail className="text-primary" /> {siteSettings.email}</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Company</h3>
            <ul className="flex flex-col gap-2 text-sm text-customGray">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Policies</h3>
            <ul className="flex flex-col gap-2 text-sm text-customGray">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Subscription and Socials */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-customGray leading-5">
              Subscribe to get notified about new arrivals, sales, and today's hot deals!
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="relative mt-2">
              <input
                type="email"
                placeholder="Enter your email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bg-primary text-black p-2 rounded-full hover:bg-primary/95 transition-colors"
              >
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-customGray border-t border-white/5 pt-6 mt-8">
          <p>© {new Date().getFullYear()} VKS Marketing. All Rights Reserved. Designed for premium homes.</p>
          
          {/* Safe Checkout Badges */}
          <div className="flex gap-1.5 items-center flex-wrap justify-center">
            {['UPI', 'Google Pay', 'NetBanking', 'COD Available'].map((method) => (
              <span key={method} className="px-2 py-0.5 border border-white/10 dark:border-white/5 rounded text-[8px] font-bold tracking-widest text-customGray uppercase">
                {method}
              </span>
            ))}
          </div>

          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a>
          </div>
        </div>
      </footer>



      {/* Gamified Spin to Win Floating Widget */}
      <SpinToWin />

      {/* Dynamic Products Comparison Drawer */}
      <CompareDrawer />

      {/* AI Space Concierge Chat Assistant */}
      <SpaceConcierge />

      {/* Slide-out Mini Cart Drawer Summary */}
      <MiniCart />

    </div>
  );
};

export default MainLayout;
