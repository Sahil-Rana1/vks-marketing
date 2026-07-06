import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { setWishlist } from '../redux/wishlistSlice.js';
import { setCart } from '../redux/cartSlice.js';
import API from '../services/api.js';

const Wishlist = () => {
  const { products } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const handleRemoveWishlist = async (productId) => {
    try {
      const res = await API.post('/wishlist/toggle', { productId });
      if (res.data.success) {
        dispatch(setWishlist(res.data.wishlist));
        showToast('Product removed from wishlist', 'info');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const res = await API.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        color: product.color?.[0] || '',
        size: product.size?.[0] || ''
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Item moved to cart successfully!', 'success');
        
        // Remove from wishlist after moving to cart
        handleRemoveWishlist(product._id);
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center select-none">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl mx-auto mb-6">
          <FiHeart />
        </div>
        <h2 className="text-2xl font-black text-secondary dark:text-white mb-3">Please Sign In</h2>
        <p className="text-sm text-customGray mb-6">To view your wishlist products, please sign in to your account.</p>
        <Link to="/login" className="px-8 py-3 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl font-bold text-sm shadow block">
          Log In / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-8 text-left">Your Wishlist</h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {products.map((prod) => {
            const discountedPrice = prod.price * (1 - prod.discount / 100);
            return (
              <div
                key={prod._id}
                className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl overflow-hidden shadow-sm flex flex-col relative group hover:shadow-md transition-shadow"
              >
                {/* Delete button */}
                <button
                  onClick={() => handleRemoveWishlist(prod._id)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full text-customGray hover:text-red-500 border border-transparent transition-all"
                  title="Remove from Wishlist"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>

                {/* Product image link */}
                <Link to={`/product/${prod.slug}`} className="block relative aspect-square overflow-hidden bg-customGray-light/35 dark:bg-black/40">
                  <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-[10px] text-customGray font-bold uppercase tracking-wider mb-1">{prod.brand}</p>
                  <Link to={`/product/${prod.slug}`}>
                    <h3 className="font-bold text-sm text-secondary dark:text-white hover:text-primary transition-colors truncate mb-3">
                      {prod.title}
                    </h3>
                  </Link>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex flex-col">
                      <span className="font-black text-base text-secondary dark:text-white">₹{discountedPrice.toFixed(2)}</span>
                      {prod.discount > 0 && (
                        <span className="text-[10px] text-customGray line-through">₹{prod.price.toFixed(0)}</span>
                      )}
                    </div>

                    {prod.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="px-3 py-2 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl hover:bg-primary hover:text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <FiShoppingCart /> Add to Cart
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-red-500 uppercase px-2 py-1.5 bg-red-500/10 rounded-lg">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl shadow-sm select-none">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
            <FiHeart />
          </div>
          <h2 className="text-xl font-bold text-secondary dark:text-white mb-2">Your Wishlist is Empty</h2>
          <p className="text-sm text-customGray mb-6">Create a wishlist to keep track of items you plan to buy later.</p>
          <Link to="/shop" className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl shadow inline-block transition-all">
            Browse Products
          </Link>
        </div>
      )}

    </div>
  );
};

export default Wishlist;
