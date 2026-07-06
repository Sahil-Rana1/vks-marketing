import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiTrash2, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { setCart, selectCartSubtotal } from '../redux/cartSlice.js';
import API from '../services/api.js';

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { recentlyViewed } = useSelector((state) => state.products);
  
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleQuantityChange = async (productId, quantity, color, size) => {
    if (quantity < 1) return;
    try {
      const res = await API.put('/cart/update', { productId, quantity, color, size });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
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
        showToast('Item removed from cart', 'info');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await API.delete('/cart/clear');
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        showToast('Cart cleared successfully', 'info');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  // Calculations
  const shippingCharges = subtotal >= 500 ? 0 : 40;
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
  const totalAmount = subtotal + shippingCharges + taxAmount;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center select-none">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl mx-auto mb-6">
          <FiShoppingCart />
        </div>
        <h2 className="text-2xl font-black text-secondary dark:text-white mb-3">Please Sign In</h2>
        <p className="text-sm text-customGray mb-6">To view your shopping cart and complete checkouts, sign in to your VKS Marketing account.</p>
        <Link to="/login" className="px-8 py-3 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl font-bold text-sm shadow block">
          Log In / Register
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      <h1 className="text-3xl font-black text-secondary dark:text-white mb-8 text-left">Your Shopping Cart</h1>

      {items.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN - ITEMS LIST */}
          <div className="w-full lg:w-2/3 space-y-4">
            <div className="flex justify-between items-center select-none font-semibold border-b border-customGray-light dark:border-white/5 pb-3">
              <span className="text-sm text-customGray">Cart items ({items.length})</span>
              <button onClick={handleClearCart} className="text-xs text-red-500 hover:underline flex items-center gap-1.5"><FiTrash2 /> Clear Cart</button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => {
                const product = item.product;
                if (!product) return null;
                const priceAfterDiscount = product.price * (1 - product.discount / 100);

                return (
                  <div
                    key={`${product._id}-${item.color}-${item.size}-${idx}`}
                    className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center text-left"
                  >
                    {/* Image */}
                    <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded-2xl border bg-customGray-light/40" />

                    {/* Title & Attributes */}
                    <div className="flex-grow min-w-0">
                      <Link to={`/product/${product.slug}`} className="font-bold text-sm text-secondary dark:text-white hover:text-primary transition-colors block truncate mb-1">
                        {product.title}
                      </Link>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-customGray font-semibold">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>Size: {item.size}</span>}
                        <span>SKU: {product.sku}</span>
                      </div>
                    </div>

                    {/* Qty Selector */}
                    <div className="flex border border-customGray-light dark:border-white/10 rounded-xl overflow-hidden self-center sm:self-auto select-none">
                      <button
                        onClick={() => handleQuantityChange(product._id, item.quantity - 1, item.color, item.size)}
                        className="px-3 py-1.5 hover:bg-customGray-light dark:hover:bg-white/5 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 self-center text-xs font-bold text-center w-10">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(product._id, item.quantity + 1, item.color, item.size)}
                        className="px-3 py-1.5 hover:bg-customGray-light dark:hover:bg-white/5 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col text-right sm:w-28 self-end sm:self-auto flex-shrink-0">
                      <span className="font-black text-sm text-secondary dark:text-white">₹{(priceAfterDiscount * item.quantity).toFixed(2)}</span>
                      {product.discount > 0 && (
                        <span className="text-[10px] text-customGray font-semibold block">₹{priceAfterDiscount.toFixed(0)} each</span>
                      )}
                    </div>

                    {/* Delete Icon */}
                    <button
                      onClick={() => handleRemoveItem(product._id, item.color, item.size)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-customGray transition-colors self-center sm:self-auto"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN - SUMMARY SUMMARY */}
          <div className="w-full lg:w-1/3 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-[32px] p-6 shadow-sm text-left sticky top-28 select-none">
            
            {/* Free Shipping Goal Ticker Progress Bar */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-white/5 rounded-2xl">
              {subtotal >= 500 ? (
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between text-xs font-black text-emerald-500">
                    <span>Free Shipping Goal</span>
                    <span>100% Unlocked</span>
                  </div>
                  <div className="w-full bg-gray-250 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500 w-full" />
                  </div>
                  <p className="text-[10px] text-emerald-500 font-bold">🎉 Your order qualifies for Free Shipping!</p>
                </div>
              ) : (
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between text-xs font-bold text-secondary dark:text-white">
                    <span>Free Shipping Goal</span>
                    <span className="text-[10px] text-primary font-black">₹{subtotal.toFixed(0)} / ₹500</span>
                  </div>
                  <div className="w-full bg-gray-250 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-customGray font-semibold leading-normal">
                    Add items worth <span className="text-primary font-black">₹{(500 - subtotal).toFixed(0)}</span> more to unlock <span className="font-extrabold text-secondary dark:text-white">FREE Shipping</span>!
                  </p>
                </div>
              )}
            </div>

            <h3 className="font-extrabold text-base text-secondary dark:text-white mb-6 border-b border-customGray-light dark:border-white/5 pb-3">Order Summary</h3>
            
            <div className="space-y-4 text-sm font-semibold text-customGray mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-secondary dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="text-secondary dark:text-white">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-secondary dark:text-white">{shippingCharges === 0 ? 'Free' : `₹${shippingCharges.toFixed(2)}`}</span>
              </div>
              {shippingCharges > 0 && (
                <p className="text-[10px] text-primary italic leading-normal">Add items worth ₹{(500 - subtotal).toFixed(0)} more for Free Shipping!</p>
              )}
              <hr className="border-customGray-light dark:border-white/5" />
              <div className="flex justify-between text-base font-black text-secondary dark:text-white">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow transition-all"
            >
              Checkout Now <FiArrowRight />
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl shadow-sm mb-16 select-none">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
            <FiShoppingCart />
          </div>
          <h2 className="text-xl font-bold text-secondary dark:text-white mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-customGray mb-6">Explore our curated selections and add household items to get started.</p>
          <Link to="/shop" className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-xl shadow inline-block transition-all">
            Continue Shopping
          </Link>
        </div>
      )}

      {/* RECENTLY VIEWED PANEL fallback */}
      {items.length === 0 && recentlyViewed.length > 0 && (
        <div className="text-left select-none border-t border-customGray-light dark:border-white/5 pt-10">
          <h3 className="font-extrabold text-base text-secondary dark:text-white mb-6">Pick Up Where You Left Off</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {recentlyViewed.map((prod) => (
              <Link
                key={prod._id}
                to={`/product/${prod.slug}`}
                className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-2xl overflow-hidden p-2 flex flex-col hover:border-primary transition-all group"
              >
                <img src={prod.images[0]} alt={prod.title} className="w-full aspect-square object-cover rounded-xl mb-2" />
                <h4 className="text-xs font-bold truncate text-secondary dark:text-white group-hover:text-primary leading-tight">{prod.title}</h4>
                <p className="text-[10px] text-primary font-bold mt-1">₹{(prod.price * (1 - prod.discount / 100)).toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
