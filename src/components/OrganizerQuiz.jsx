import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiArrowRight, FiArrowLeft, FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../redux/cartSlice.js';

const OrganizerQuiz = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    area: '',
    feature: '',
    budget: ''
  });
  const [products, setProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Load products to run match algorithm locally
    const loadProductsData = async () => {
      try {
        const res = await API.get('/products?limit=20');
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load products for quiz:', err);
      }
    };
    if (isOpen) {
      loadProductsData();
      // Reset quiz state when opened
      setStep(1);
      setAnswers({ area: '', feature: '', budget: '' });
      setMatches([]);
    }
  }, [isOpen]);

  const selectAnswer = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      calculateMatches();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculateMatches = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...products];

      // Step 1: Area matching
      if (answers.area === 'kitchen') {
        filtered = filtered.filter(p => p.category?.slug === 'kitchen-dining' || p.title.toLowerCase().includes('soap') || p.title.toLowerCase().includes('container'));
      } else if (answers.area === 'bathroom') {
        filtered = filtered.filter(p => p.category?.slug === 'bathroom-accessories' || p.title.toLowerCase().includes('toothbrush'));
      } else if (answers.area === 'closet') {
        filtered = filtered.filter(p => p.category?.slug === 'home-organizers' || p.title.toLowerCase().includes('sunglasses') || p.title.toLowerCase().includes('cosmetic'));
      } else if (answers.area === 'office') {
        filtered = filtered.filter(p => p.category?.slug === 'household-essentials' || p.title.toLowerCase().includes('extension') || p.title.toLowerCase().includes('board'));
      }

      // Step 2: Feature priority
      if (answers.feature === 'airtight') {
        filtered = filtered.filter(p => p.description.toLowerCase().includes('airtight') || p.description.toLowerCase().includes('leak'));
      } else if (answers.feature === 'velvet') {
        filtered = filtered.filter(p => p.description.toLowerCase().includes('velvet') || p.description.toLowerCase().includes('lining'));
      } else if (answers.feature === 'multiple') {
        filtered = filtered.filter(p => p.description.toLowerCase().includes('usb') || p.description.toLowerCase().includes('outlet') || p.description.toLowerCase().includes('functional'));
      } else if (answers.feature === 'portable') {
        filtered = filtered.filter(p => p.description.toLowerCase().includes('travel') || p.description.toLowerCase().includes('portable'));
      }

      // Step 3: Budget check
      if (answers.budget === 'low') {
        filtered = filtered.filter(p => (p.price * (1 - p.discount / 100)) <= 250);
      } else if (answers.budget === 'medium') {
        filtered = filtered.filter(p => (p.price * (1 - p.discount / 100)) <= 500);
      }

      // Fallback: If no matches, return featured items
      if (filtered.length === 0) {
        filtered = products.filter(p => p.featured).slice(0, 2);
      }

      setMatches(filtered.slice(0, 3));
      setStep(4);
      setLoading(false);
    }, 1000);
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
        showToast(`${product.title.slice(0, 20)}... added to cart!`, 'success');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[#131722] rounded-[36px] p-6 sm:p-8 shadow-2xl border border-gray-150 dark:border-white/5 z-50 text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-secondary dark:text-white"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Concierge Service</span>
          <h2 className="text-2xl font-black text-secondary dark:text-white mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {step < 4 ? 'Smart Organizer Finder' : 'Your Matching Organizers'}
          </h2>
          <p className="text-xs text-customGray font-medium mt-0.5">
            {step < 4 ? `Step ${step} of 3: Answer a few quick storage queries.` : 'Based on your storage answers, we recommend these fits:'}
          </p>
        </div>

        {/* Content Wizard Steps */}
        <div className="min-h-[220px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                {[
                  { id: 'kitchen', title: 'Kitchen & Diners', desc: 'Airtight storage, spice jars, dispenser containers' },
                  { id: 'bathroom', title: 'Bathroom & Wash', desc: 'Brush cases, wall racks, vanity sets' },
                  { id: 'closet', title: 'Closet & Wardrobes', desc: 'Sunglasses organizer slots, cosmetics dividers' },
                  { id: 'office', title: 'Tech & Household', desc: 'Spike protector boards, universal multi-plugs' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectAnswer('area', item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between h-[100px] ${
                      answers.area === item.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-gray-200 dark:border-white/5 bg-transparent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</span>
                      {answers.area === item.id && <FiCheck className="text-primary w-4 h-4" />}
                    </div>
                    <p className="text-[10px] text-customGray leading-normal font-semibold">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                {[
                  { id: 'airtight', title: 'Leak-proof Seals', desc: 'Vacuum air locks to preserve freshness' },
                  { id: 'velvet', title: 'Soft Inner Liners', desc: 'Protective velvet layers for delicate scopes' },
                  { id: 'multiple', title: 'USB & Plug Outlets', desc: 'Surge protection spike guards and extensions' },
                  { id: 'portable', title: 'Travel Compact', desc: 'Travel friendly toothbrush caps and cups' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectAnswer('feature', item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between h-[100px] ${
                      answers.feature === item.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-gray-200 dark:border-white/5 bg-transparent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</span>
                      {answers.feature === item.id && <FiCheck className="text-primary w-4 h-4" />}
                    </div>
                    <p className="text-[10px] text-customGray leading-normal font-semibold">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
              >
                {[
                  { id: 'low', title: 'Budget Fit', desc: 'Under ₹250' },
                  { id: 'medium', title: 'Mid Range', desc: 'Under ₹500' },
                  { id: 'high', title: 'Ultimate Sets', desc: '₹500 & Above' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectAnswer('budget', item.id)}
                    className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between h-[110px] ${
                      answers.budget === item.id
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                        : 'border-gray-200 dark:border-white/5 bg-transparent hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</span>
                      {answers.budget === item.id && <FiCheck className="text-primary w-4 h-4" />}
                    </div>
                    <p className="text-xs text-primary font-black mt-2">{item.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : matches.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {matches.map((prod) => {
                      const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));
                      return (
                        <div
                          key={prod._id}
                          className="flex gap-4 p-3 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-white/5 rounded-2xl items-center justify-between"
                        >
                          <div className="flex gap-3 items-center">
                            <img src={prod.images[0]} alt={prod.title} className="w-12 h-12 object-contain bg-white dark:bg-transparent rounded-lg" />
                            <div className="text-left">
                              <h4 className="font-extrabold text-xs sm:text-sm text-secondary dark:text-white max-w-xs truncate">{prod.title}</h4>
                              <p className="text-xs font-black text-primary mt-0.5">₹{finalPrice}</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link
                              to={`/product/${prod.slug}`}
                              onClick={onClose}
                              className="p-2 bg-gray-150 dark:bg-white/5 hover:bg-primary dark:hover:bg-primary text-secondary dark:text-white hover:text-black dark:hover:text-black rounded-lg transition-colors"
                              title="Details"
                            >
                              <FiChevronRight className="w-4 h-4" />
                            </Link>
                            {prod.stock > 0 && (
                              <button
                                onClick={() => handleAddToCart(prod)}
                                className="p-2 bg-primary text-black hover:bg-primary/95 rounded-lg transition-colors"
                                title="Add to Cart"
                              >
                                <FiShoppingCart className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-customGray italic">No direct matches found. Try checking our general catalogs!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wizard Footer Nav Actions */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center select-none">
          {step > 1 && step < 4 ? (
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 border border-gray-250 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              disabled={
                (step === 1 && !answers.area) ||
                (step === 2 && !answers.feature) ||
                (step === 3 && !answers.budget)
              }
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-black disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all"
            >
              {step === 3 ? 'Get Matches' : 'Continue'} <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Finished
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default OrganizerQuiz;
