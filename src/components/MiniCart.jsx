import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart, selectCartSubtotal } from '../redux/cartSlice.js';
import API from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { playClickSound, playCartChime } from '../utils/audio.js';

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const subtotal = useSelector(selectCartSubtotal);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('vks_open_minicart', handleOpen);
    return () => window.removeEventListener('vks_open_minicart', handleOpen);
  }, []);

  const handleQuantityChange = async (productId, quantity, color, size) => {
    if (quantity < 1) return;
    try {
      const res = await API.put('/cart/update', { productId, quantity, color, size });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        playClickSound();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleRemoveItem = async (productId, color, size) => {
    try {
      const res = await API.delete('/cart/remove', {
        data: { productId, color, size }
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Item removed', 'info');
        playClickSound();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleCheckout = () => {
    setIsOpen(false);
    playClickSound();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[180] flex justify-end select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsOpen(false);
            playClickSound();
          }}
          className="absolute inset-0 bg-black pointer-events-auto"
        />

        {/* Sidebar Panel Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-md h-full bg-white/95 dark:bg-[#131722]/95 border-l border-gray-150 dark:border-white/5 shadow-2xl backdrop-blur-md p-6 flex flex-col pointer-events-auto text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <FiShoppingCart className="text-primary w-5 h-5" />
              <h3 className="font-extrabold text-base text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Mini Cart Summary</h3>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                playClickSound();
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-secondary dark:text-white transition-all"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-1">
            {!isAuthenticated ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs text-customGray font-bold">Please log in to load shopping items.</p>
                <Link to="/login" onClick={() => setIsOpen(false)} className="inline-block px-4 py-2 bg-primary text-black text-xs font-black rounded-lg uppercase tracking-wider">Sign In</Link>
              </div>
            ) : items.length > 0 ? (
              items.map((item, idx) => {
                const prod = item.product;
                if (!prod) return null;
                const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));

                return (
                  <div
                    key={`${prod._id}-${item.color}-${item.size}-${idx}`}
                    className="flex gap-3 p-3 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-white/5 rounded-2xl items-center"
                  >
                    <img src={prod.images[0]} alt={prod.title} className="w-12 h-12 object-contain bg-white dark:bg-transparent rounded-lg flex-shrink-0" />
                    
                    <div className="flex-grow min-w-0">
                      <h4 className="font-extrabold text-xs text-secondary dark:text-white truncate">{prod.title}</h4>
                      <p className="text-[10px] text-customGray mt-0.5">₹{finalPrice} {item.color && `| Color: ${item.color}`}</p>
                      
                      {/* Qty edit */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          onClick={() => handleQuantityChange(prod._id, item.quantity - 1, item.color, item.size)}
                          className="w-5 h-5 border border-gray-250 dark:border-white/10 flex items-center justify-center rounded text-xs font-bold text-secondary dark:text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(prod._id, item.quantity + 1, item.color, item.size)}
                          className="w-5 h-5 border border-gray-250 dark:border-white/10 flex items-center justify-center rounded text-xs font-bold text-secondary dark:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(prod._id, item.color, item.size)}
                      className="p-2 text-customGray hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 text-xs text-customGray font-semibold italic">
                Your shopping cart is currently empty.
              </div>
            )}
          </div>

          {/* Footer Area with Progress Bar */}
          {isAuthenticated && items.length > 0 && (
            <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-4 space-y-4">
              {/* Free Shipping Goal Ticker Progress Bar */}
              <div className="p-3 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-white/5 rounded-2xl">
                {subtotal >= 500 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-500 block">🎉 Free Shipping Unlocked!</span>
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-secondary dark:text-white">
                      <span>Free Shipping Goal</span>
                      <span className="text-primary font-black">₹{subtotal.toFixed(0)} / ₹500</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-customGray block">Add ₹{(500 - subtotal).toFixed(0)} more for Free Shipping!</span>
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-extrabold text-customGray">Cart Subtotal</span>
                <span className="font-black text-base text-secondary dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/cart"
                  onClick={() => {
                    setIsOpen(false);
                    playClickSound();
                  }}
                  className="w-1/2 py-3 border border-gray-250 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  View Cart
                </Link>
                <button
                  onClick={handleCheckout}
                  className="w-1/2 py-3 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow shadow-primary/10"
                >
                  Checkout <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MiniCart;
