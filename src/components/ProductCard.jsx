import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiX, FiCheck } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { playClickSound, playCartChime } from '../utils/audio.js';
import API from '../services/api.js';
import { setCart } from '../redux/cartSlice.js';
import { setWishlist } from '../redux/wishlistSlice.js';

const ProductCard = ({ product }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const wishlistProducts = useSelector((state) => state.wishlist.products);
  const isWishlisted = wishlistProducts.some((p) => p._id === product._id);

  // Price calculations
  const discountedPrice = product.price * (1 - product.discount / 100);
  const formattedPrice = discountedPrice.toFixed(2);
  const originalPrice = product.price.toFixed(2);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please login to manage your wishlist', 'warning');
      return;
    }
    try {
      const res = await API.post('/wishlist/toggle', { productId: product._id });
      if (res.data.success) {
        dispatch(setWishlist(res.data.wishlist));
        showToast(res.data.message, 'success');
        playClickSound();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'warning');
      return;
    }
    try {
      const res = await API.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        color: product.color[0] || '',
        size: product.size[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Added to cart successfully!', 'success');
        playCartChime();
        window.dispatchEvent(new Event('vks_open_minicart'));
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleQuickViewAdd = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to cart', 'warning');
      return;
    }
    try {
      const res = await API.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        color: selectedColor || product.color[0] || '',
        size: selectedSize || product.size[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Added to cart successfully!', 'success');
        playCartChime();
        window.dispatchEvent(new Event('vks_open_minicart'));
        setIsQuickViewOpen(false);
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <>
      <div
        className="bg-white dark:bg-[#131722] border border-black/[0.04] dark:border-white/5 rounded-[24px] overflow-hidden relative flex flex-col h-full group shadow-[0_12px_35px_rgba(139,92,26,0.025)] hover:-translate-y-2 hover:border-primary/40 dark:hover:border-primary/30 hover:shadow-[0_22px_45px_rgba(245,158,11,0.07)] dark:hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] transition-all duration-500"
      >
        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm transition-all bg-white/80 dark:bg-black/60 backdrop-blur-sm ${
            isWishlisted
              ? 'border-red-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
              : 'border-transparent text-secondary dark:text-white hover:text-red-500'
          }`}
        >
          <FiHeart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-primary text-black text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full shadow-sm">
            {product.discount}% OFF
          </div>
        )}

        {/* Product Image Area */}
        <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F5F5F3] dark:bg-black/20 p-4 flex items-center justify-center">
          <img
            src={product.images[0]}
            alt={product.title}
            className="max-h-full max-w-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500 filter drop-shadow-sm"
            loading="lazy"
          />
          {/* Quick Actions Hover Overlay */}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center gap-2.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="p-2.5 bg-white text-secondary hover:bg-primary hover:text-black rounded-full shadow-lg transition-colors duration-200"
              title="Quick View"
            >
              <FiEye className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>

        {/* Product Content Details */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category */}
          {product.category && (
            <p className="text-[10px] text-customGray font-medium uppercase tracking-wider mb-1">
              {typeof product.category === 'object' ? product.category.name : 'Essentials'}
            </p>
          )}

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-bold text-sm line-clamp-2 text-secondary dark:text-white group-hover:text-primary transition-colors min-h-[40px] mb-2 leading-relaxed">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3 select-none">
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xs">
                  {i < Math.round(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            {product.rating > 0 && (
              <span className="text-[10px] text-customGray font-semibold">({product.rating.toFixed(1)})</span>
            )}
          </div>

          {/* Price and Add button footer */}
          <div className="flex justify-between items-center mt-auto">
            <div className="flex flex-col">
              {product.discount > 0 ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-secondary dark:text-white">₹{formattedPrice}</span>
                  <span className="text-xs text-customGray line-through">₹{originalPrice}</span>
                </div>
              ) : (
                <span className="text-base font-bold text-secondary dark:text-white">₹{originalPrice}</span>
              )}
            </div>

            {/* Quick Add CTA */}
            {product.stock > 0 ? (
              <button
                onClick={handleQuickAdd}
                className="flex items-center gap-1 py-2.5 px-3 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl hover:bg-primary hover:text-black transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                <FiShoppingCart className="w-4 h-4" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-[40px] transition-all duration-300 ease-in-out font-black text-[10px] uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 ml-1">
                  Add
                </span>
              </button>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 px-2 py-1.5 bg-red-500/10 rounded-lg">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {isQuickViewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickViewOpen(false)}
              className="absolute inset-0 bg-black"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-4xl w-full bg-white dark:bg-customGray-dark rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 glassmorphism border dark:border-white/5 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQuickViewOpen(false)}
                className="absolute top-4 right-4 p-2 bg-customGray-light dark:bg-black/40 rounded-full hover:bg-primary hover:text-black transition-colors z-10"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Product Images Slider */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full aspect-square object-cover rounded-2xl border dark:border-white/5 bg-customGray-light/40 dark:bg-black/20"
                />
              </div>

              {/* Product Metadata Info */}
              <div className="w-full md:w-1/2 flex flex-col">
                <p className="text-xs text-customGray font-semibold uppercase tracking-wider mb-1">VKS Marketing</p>
                <h2 className="text-xl md:text-2xl font-extrabold text-secondary dark:text-white leading-snug mb-3">
                  {product.title}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4 select-none">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < Math.round(product.rating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-customGray">({product.rating.toFixed(1)} / 5)</span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mb-4 border-b border-customGray-light dark:border-white/5 pb-4">
                  <span className="text-2xl font-black text-secondary dark:text-white">₹{formattedPrice}</span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-sm text-customGray line-through">₹{originalPrice}</span>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Save {product.discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Description snippet */}
                <p className="text-sm text-customGray leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>

                {/* Attributes: Color */}
                {product.color && product.color.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Color</span>
                    <div className="flex gap-2">
                      {product.color.map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            (selectedColor || product.color[0]) === col
                              ? 'border-primary bg-primary text-black'
                              : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                          }`}
                        >
                          {col}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attributes: Size */}
                {product.size && product.size.length > 0 && (
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-customGray block mb-2">Size</span>
                    <div className="flex gap-2">
                      {product.size.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            (selectedSize || product.size[0]) === sz
                              ? 'border-primary bg-primary text-black'
                              : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Actions */}
                <div className="mt-auto">
                  {product.stock > 0 ? (
                    <button
                      onClick={handleQuickViewAdd}
                      className="w-full py-3 bg-secondary hover:bg-secondary/90 dark:bg-primary dark:text-black dark:hover:bg-primary/95 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                      <FiShoppingCart /> Add to Cart
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-2xl text-center">
                      Product Sold Out
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
