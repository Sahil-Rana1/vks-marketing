import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiShoppingCart, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../redux/cartSlice.js';
import API from '../services/api.js';
import { playClickSound, playCartChime, playSuccessSound } from '../utils/audio.js';

const SpaceConcierge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi there! I am your VKS Space Concierge. 🌟 Let me help you clear the clutter and find the perfect organizers. Which area of your home needs sorting today?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState([]);
  const [muted, setMuted] = useState(localStorage.getItem('vks_mute_sounds') === 'true');

  const { showToast } = useToast();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load products database for local recommendations
    const loadProducts = async () => {
      try {
        const res = await API.get('/products?limit=20');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load products for concierge:', err);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom of chat
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleMute = () => {
    const newState = !muted;
    setMuted(newState);
    localStorage.setItem('vks_mute_sounds', newState.toString());
    playClickSound();
  };

  const handleQuickOption = (optionText, targetCategory) => {
    playClickSound();
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: optionText
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      // Find matching products
      let matches = [];
      let replyText = '';

      if (targetCategory === 'kitchen') {
        matches = products.filter(p => p.category?.slug === 'kitchen-dining' || p.title.toLowerCase().includes('container') || p.title.toLowerCase().includes('soap'));
        replyText = 'For the kitchen, I highly recommend our food-grade airtight containers and smart soap dispensers to keep countertops clean:';
      } else if (targetCategory === 'bathroom') {
        matches = products.filter(p => p.category?.slug === 'bathroom-accessories' || p.title.toLowerCase().includes('toothbrush'));
        replyText = 'Keep your washroom premium and hygiene-first. Check out these bathroom accessories:';
      } else if (targetCategory === 'closet') {
        matches = products.filter(p => p.category?.slug === 'home-organizers' || p.title.toLowerCase().includes('sunglasses') || p.title.toLowerCase().includes('cosmetic'));
        replyText = 'Here are our premium velvet-lined organizers to sort accessories and sunglasses:';
      } else if (targetCategory === 'tech') {
        matches = products.filter(p => p.category?.slug === 'household-essentials' || p.title.toLowerCase().includes('extension') || p.title.toLowerCase().includes('board'));
        replyText = 'Clear power cables clutter with our multi-port hexagon spike guards:';
      } else if (targetCategory === 'deals') {
        matches = products.filter(p => p.discount >= 15);
        replyText = 'Here are our top active discount deals of the week:';
      }

      if (matches.length === 0) {
        matches = products.slice(0, 2);
        replyText = 'I could not find exact matches, but these best sellers fit any space beautifully:';
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          products: matches.slice(0, 2)
        }
      ]);
      playCartChime();
    }, 1000);
  };

  const handleAddToCart = async (product) => {
    playClickSound();
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
        showToast('Product added from Concierge!', 'success');
        playSuccessSound();
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  return (
    <>
      {/* Floating Concierge Chat trigger */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 3.5 }}
        onClick={() => {
          setIsOpen(true);
          playClickSound();
        }}
        className="fixed bottom-24 right-6 z-40 p-4 bg-secondary dark:bg-[#1E293B] text-white rounded-full shadow-lg cursor-pointer hover:scale-105 transition-all flex items-center justify-center border border-white/10 select-none"
        title="VKS Concierge Assistant"
      >
        <FiMessageSquare className="w-6 h-6 animate-pulse" />
      </motion.div>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex justify-end p-4 select-none pointer-events-none">
            {/* Backdrop wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                playClickSound();
              }}
              className="absolute inset-0 bg-black pointer-events-auto"
            />

            {/* Chat Drawer Box */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.98 }}
              className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:right-24 z-50 max-w-sm w-[92vw] sm:w-full h-[80vh] sm:h-[75vh] bg-white/95 dark:bg-[#131722]/95 border border-gray-150 dark:border-white/5 rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-sm text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>VKS Space Concierge</h3>
                    <p className="text-[9px] text-customGray font-semibold">Self-contained home organizing AI</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {/* Sound control toggle button */}
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-customGray hover:text-secondary dark:hover:text-white transition-all"
                    title={muted ? 'Unmute sounds' : 'Mute sounds'}
                  >
                    {muted ? <FiVolumeX className="w-4 h-4 text-red-400" /> : <FiVolume2 className="w-4 h-4 text-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      playClickSound();
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-secondary dark:text-white transition-all"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed max-w-[85%] text-left ${
                        msg.sender === 'user'
                          ? 'bg-primary text-black rounded-tr-none'
                          : 'bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-white/5 text-secondary dark:text-white rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Inline product recommendation cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="w-full mt-3 flex flex-col gap-2">
                        {msg.products.map((prod) => {
                          const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));
                          return (
                            <div
                              key={prod._id}
                              className="flex gap-3 p-2 bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-white/5 rounded-xl items-center justify-between"
                            >
                              <div className="flex gap-2 items-center min-w-0">
                                <img src={prod.images[0]} alt={prod.title} className="w-10 h-10 object-contain bg-white dark:bg-transparent rounded-lg flex-shrink-0" />
                                <div className="text-left min-w-0">
                                  <h4 className="font-extrabold text-[11px] text-secondary dark:text-white truncate max-w-[120px]">{prod.title}</h4>
                                  <p className="text-[10px] font-black text-primary">₹{finalPrice}</p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Link
                                  to={`/product/${prod.slug}`}
                                  onClick={() => {
                                    setIsOpen(false);
                                    playClickSound();
                                  }}
                                  className="p-1.5 bg-gray-200 dark:bg-white/5 hover:bg-primary rounded-lg text-secondary dark:text-white hover:text-black transition-colors"
                                  title="Details"
                                >
                                  <FiChevronRight className="w-3.5 h-3.5" />
                                </Link>
                                {prod.stock > 0 && (
                                  <button
                                    onClick={() => handleAddToCart(prod)}
                                    className="p-1.5 bg-primary text-black hover:bg-primary/90 rounded-lg transition-colors"
                                    title="Add to Cart"
                                  >
                                    <FiShoppingCart className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicators */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 bg-gray-50 dark:bg-black/35 rounded-2xl rounded-tl-none border border-gray-150 dark:border-white/5 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-customGray animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-customGray animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-customGray animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Options Bottom Drawer */}
              <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/25 flex flex-col gap-2">
                <span className="text-[9px] font-black text-customGray text-left uppercase tracking-wider pl-1 select-none">Quick Recommendations</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                  {[
                    { label: '🍳 Kitchen containers', cat: 'kitchen' },
                    { label: '🧼 Bathroom racks', cat: 'bathroom' },
                    { label: '🕶 Sunglasses storage', cat: 'closet' },
                    { label: '🔌 Power plugs', cat: 'tech' },
                    { label: '🔥 Best Discounts', cat: 'deals' }
                  ].map((opt) => (
                    <button
                      key={opt.cat}
                      onClick={() => handleQuickOption(opt.label, opt.cat)}
                      className="px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-secondary dark:text-white rounded-full text-[10px] font-bold whitespace-nowrap hover:border-primary transition-colors flex-shrink-0"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SpaceConcierge;
