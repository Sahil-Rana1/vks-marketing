import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiShoppingCart, FiMinusCircle, FiColumns } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '../redux/cartSlice.js';
import API from '../services/api.js';

export const addToCompare = (product, showToast) => {
  const current = localStorage.getItem('vks_compare_list')
    ? JSON.parse(localStorage.getItem('vks_compare_list'))
    : [];
  
  if (current.find(p => p._id === product._id)) {
    showToast('Product already added to comparison!', 'info');
    return;
  }
  if (current.length >= 3) {
    showToast('You can compare a maximum of 3 products side-by-side.', 'warning');
    return;
  }
  const updated = [...current, product];
  localStorage.setItem('vks_compare_list', JSON.stringify(updated));
  window.dispatchEvent(new Event('vks_compare_updated'));
  showToast('Added to compare list!', 'success');
};

const CompareDrawer = () => {
  const [compared, setCompared] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadCompareList = () => {
      const list = localStorage.getItem('vks_compare_list')
        ? JSON.parse(localStorage.getItem('vks_compare_list'))
        : [];
      setCompared(list);
    };

    loadCompareList();
    window.addEventListener('vks_compare_updated', loadCompareList);
    return () => window.removeEventListener('vks_compare_updated', loadCompareList);
  }, []);

  const handleRemove = (id) => {
    const updated = compared.filter(p => p._id !== id);
    localStorage.setItem('vks_compare_list', JSON.stringify(updated));
    window.dispatchEvent(new Event('vks_compare_updated'));
  };

  const handleClearAll = () => {
    localStorage.removeItem('vks_compare_list');
    window.dispatchEvent(new Event('vks_compare_updated'));
    setIsExpanded(false);
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

  if (compared.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[150] bg-white dark:bg-[#131722] border-t border-gray-200 dark:border-white/5 shadow-[0_-15px_40px_rgba(0,0,0,0.15)] select-none text-left"
      >
        {!isExpanded ? (
          /* Minimized Panel Bar */
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl"><FiColumns /></div>
              <div>
                <h4 className="font-extrabold text-sm text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Compare Essentials</h4>
                <p className="text-[10px] text-customGray font-semibold mt-0.5">Comparing {compared.length} of 3 items side-by-side.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {compared.map((prod) => (
                <div key={prod._id} className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-black/30 border border-gray-150 dark:border-white/5 rounded-xl text-xs font-semibold pr-3">
                  <img src={prod.images[0]} alt={prod.title} className="w-8 h-8 object-contain bg-white dark:bg-transparent rounded-lg" />
                  <span className="max-w-[100px] truncate text-secondary dark:text-white">{prod.title}</span>
                  <button onClick={() => handleRemove(prod._id)} className="text-red-500 hover:text-red-600 transition-colors">
                    <FiMinusCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-gray-250 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs uppercase tracking-widest shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Compare Now
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Comparison Matrix */
          <div className="max-w-7xl mx-auto px-6 py-6 max-h-[85vh] overflow-y-auto relative">
            {/* Header / Control Bar */}
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-secondary dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Compare Products Matrix</h3>
                <p className="text-xs text-customGray font-semibold mt-0.5">Analytic specifications comparison.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 border border-gray-250 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-secondary dark:text-white transition-all"
                  title="Minimize"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Spec Table Matrix */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="py-4 w-1/4 text-customGray font-bold uppercase">Specifications</th>
                  {compared.map((prod) => (
                    <th key={prod._id} className="py-4 px-4 w-1/4 text-center border-l border-gray-100 dark:border-white/5">
                      <div className="flex flex-col items-center gap-3 relative">
                        <button
                          onClick={() => handleRemove(prod._id)}
                          className="absolute -top-2 right-2 text-red-500 hover:text-red-600 transition-colors"
                          title="Remove item"
                        >
                          <FiMinusCircle className="w-4 h-4" />
                        </button>
                        <img src={prod.images[0]} alt={prod.title} className="w-24 h-24 object-contain bg-white dark:bg-transparent rounded-2xl p-2 border border-gray-100 dark:border-white/5" />
                        <h4 className="font-extrabold text-xs text-secondary dark:text-white max-w-[150px] mx-auto text-center line-clamp-2">{prod.title}</h4>
                      </div>
                    </th>
                  ))}
                  {/* Empty headers for empty slots */}
                  {[...Array(3 - compared.length)].map((_, i) => (
                    <th key={i} className="py-4 px-4 w-1/4 text-center border-l border-gray-100 dark:border-white/5 text-customGray font-semibold italic">
                      Empty compare slot
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-semibold text-secondary dark:text-white leading-normal">
                {/* Price Row */}
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <td className="py-3 text-customGray font-bold uppercase">Price</td>
                  {compared.map((prod) => {
                    const finalPrice = Math.round(prod.price * (1 - (prod.discount || 0) / 100));
                    return (
                      <td key={prod._id} className="py-3 px-4 text-center border-l border-gray-100 dark:border-white/5 text-sm font-black">
                        ₹{finalPrice} {prod.discount > 0 && <span className="text-[9px] text-red-500 font-bold bg-red-500/10 px-1.5 py-0.5 rounded ml-1">Save {prod.discount}%</span>}
                      </td>
                    );
                  })}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>

                {/* Rating Row */}
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <td className="py-3 text-customGray font-bold uppercase">Rating</td>
                  {compared.map((prod) => (
                    <td key={prod._id} className="py-3 px-4 text-center border-l border-gray-100 dark:border-white/5 text-yellow-500 font-black">
                      ★ {prod.rating ? prod.rating.toFixed(1) : '5.0'}
                    </td>
                  ))}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>

                {/* Category Row */}
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <td className="py-3 text-customGray font-bold uppercase">Category</td>
                  {compared.map((prod) => (
                    <td key={prod._id} className="py-3 px-4 text-center border-l border-gray-100 dark:border-white/5 text-xs text-customGray font-bold">
                      {typeof prod.category === 'object' ? prod.category.name : 'Essentials'}
                    </td>
                  ))}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>

                {/* Stock Row */}
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <td className="py-3 text-customGray font-bold uppercase">Availability</td>
                  {compared.map((prod) => (
                    <td key={prod._id} className="py-3 px-4 text-center border-l border-gray-100 dark:border-white/5 font-black text-xs">
                      {prod.stock > 0 ? (
                        <span className="text-emerald-500">In Stock ({prod.stock})</span>
                      ) : (
                        <span className="text-red-500">Sold Out</span>
                      )}
                    </td>
                  ))}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>

                {/* Description Row */}
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <td className="py-3 text-customGray font-bold uppercase">Specifications</td>
                  {compared.map((prod) => (
                    <td key={prod._id} className="py-3 px-4 text-center border-l border-gray-100 dark:border-white/5 text-[10px] text-customGray font-semibold leading-relaxed max-w-[180px]">
                      {prod.description}
                    </td>
                  ))}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="py-4 text-customGray font-bold uppercase">Quick Buy</td>
                  {compared.map((prod) => (
                    <td key={prod._id} className="py-4 px-4 text-center border-l border-gray-100 dark:border-white/5">
                      <div className="flex gap-2 justify-center">
                        <Link
                          to={`/product/${prod.slug}`}
                          onClick={() => setIsExpanded(false)}
                          className="px-4 py-2 border border-gray-250 dark:border-white/10 text-secondary dark:text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all"
                        >
                          Details
                        </Link>
                        {prod.stock > 0 && (
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="px-4 py-2 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-[10px] uppercase tracking-widest shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                  {[...Array(3 - compared.length)].map((_, i) => <td key={i} className="border-l border-gray-100 dark:border-white/5" />)}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareDrawer;
