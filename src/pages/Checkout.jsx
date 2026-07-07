import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMapPin, FiGift, FiTruck, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { selectCartSubtotal, setCart } from '../redux/cartSlice.js';
import API from '../services/api.js';

const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const subtotal = useSelector(selectCartSubtotal);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  // Contact details
  const [checkoutPhone, setCheckoutPhone] = useState(user?.phone || '');
  const [checkoutName, setCheckoutName] = useState(user?.name || '');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Razorpay
  const [placingOrder, setPlacingOrder] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Handle Coupon Apply
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    try {
      const res = await API.post('/coupons/validate', {
        code: couponCode,
        orderAmount: subtotal
      });
      if (res.data.success) {
        const coupon = res.data.coupon;
        setAppliedCoupon(coupon);
        
        let calculatedDiscount = 0;
        if (coupon.discountType === 'Percentage') {
          calculatedDiscount = subtotal * (coupon.discountValue / 100);
          if (coupon.maxDiscountAmount > 0 && calculatedDiscount > coupon.maxDiscountAmount) {
            calculatedDiscount = coupon.maxDiscountAmount;
          }
        } else {
          calculatedDiscount = coupon.discountValue;
        }

        setDiscountAmount(calculatedDiscount);
        showToast('Coupon applied successfully!', 'success');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  // Handle Add New Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { street, city, state, postalCode } = newAddress;
    if (!street || !city || !state || !postalCode) {
      showToast('Please fill all address fields', 'warning');
      return;
    }

    try {
      const updatedAddresses = [...(user.addresses || []), newAddress];
      const res = await API.put('/auth/addresses', { addresses: updatedAddresses });
      if (res.data.success) {
        showToast('Address added successfully!', 'success');
        setShowNewAddressForm(false);
        // Refresh page or trigger app reload. Since we have authSuccess, let's update profile state in auth slice
        dispatch({ type: 'auth/updateProfileAddresses', payload: res.data.addresses });
        setSelectedAddressIndex(res.data.addresses.length - 1);
        setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false });
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    }
  };

  // Calculations
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(discountedSubtotal * 0.18 * 100) / 100;
  const shippingCharges = discountedSubtotal >= 500 ? 0 : 40;
  const grandTotal = discountedSubtotal + taxAmount + shippingCharges;

  // Load Razorpay Script Dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Place Order Submit
  const handlePlaceOrder = async () => {
    const address = user.addresses?.[selectedAddressIndex];
    if (!address) {
      showToast('Please select or add a shipping address', 'warning');
      return;
    }

    if (!checkoutPhone) {
      showToast('Please provide a contact phone number', 'warning');
      return;
    }

    try {
      setPlacingOrder(true);
      
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          color: item.color || '',
          size: item.size || ''
        })),
        shippingAddress: {
          name: checkoutName,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: checkoutPhone
        },
        paymentMethod,
        couponCode: appliedCoupon?.code || ''
      };

      const res = await API.post('/orders', orderData);
      
      if (res.data.success) {
        // Persistently decrement mock products stock in localStorage on client side
        items.forEach((item) => {
          const prodId = item.product._id;
          if (prodId && prodId.startsWith('mock_')) {
            const currentStock = item.product.stock;
            const newStock = Math.max(0, currentStock - item.quantity);
            localStorage.setItem('mock_stock_' + prodId, newStock.toString());
          }
        });

        dispatch(setCart({ items: [] })); // Clear cart locally
        
        if (paymentMethod === 'Razorpay') {
          showToast('Initializing payment gateway...', 'info');
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            showToast('Failed to load Razorpay SDK. Check your network.', 'error');
            setPlacingOrder(false);
            return;
          }

          const options = {
            key: res.data.razorpayKeyId || '',
            amount: Math.round(grandTotal * 100),
            currency: 'INR',
            name: 'VKS Marketing',
            description: 'Order Payment',
            order_id: res.data.order.paymentDetails?.razorpayOrderId,
            prefill: {
              name: checkoutName,
              contact: checkoutPhone,
              email: user?.email || ''
            },
            handler: async function (response) {
              try {
                showToast('Verifying payment signature...', 'info');
                const verifyRes = await API.post('/orders/verify-payment', {
                  orderId: res.data.order._id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                if (verifyRes.data.success) {
                  showToast('Payment verified successfully!', 'success');
                  navigate(`/orders/${res.data.order._id}`);
                }
              } catch (err) {
                showToast('Payment verification failed', 'error');
                navigate('/orders');
              }
            },
            modal: {
              ondismiss: function () {
                showToast('Payment window closed. You can pay from your Order History.', 'warning');
                navigate('/orders');
              }
            },
            theme: {
              color: '#f59e0b'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Cash on Delivery
          showToast('Order placed successfully!', 'success');
          navigate(`/orders/${res.data.order._id}`);
        }
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none">
      
      {/* Header breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-customGray font-semibold select-none mb-8 text-left">
        <Link to="/cart" className="hover:text-primary transition-colors">Cart</Link>
        <FiChevronRight />
        <span className="text-secondary dark:text-white">Checkout details</span>
      </div>

      <h1 className="text-3xl font-black text-secondary dark:text-white mb-8 text-left">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN - ADDRESS & PAYMENT SELECTION */}
        <div className="w-full lg:w-2/3 space-y-6 text-left">
          
          {/* Shipping identity */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-base mb-4 flex items-center gap-2"><FiMapPin className="text-primary" /> Delivery Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Select address from list */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3 mb-4">
                <span className="text-xs font-bold text-customGray block">Select Shipping Address</span>
                {user.addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                    }`}
                  >
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold text-secondary dark:text-white">Address #{idx + 1}</p>
                      <p className="text-customGray font-medium mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                    </div>
                    {selectedAddressIndex === idx && <span className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-customGray font-semibold mb-4">No shipping addresses configured. Please add one below.</p>
            )}

            {/* Add Address button */}
            {!showNewAddressForm ? (
              <button
                onClick={() => setShowNewAddressForm(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Add New Shipping Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="border-t border-customGray-light dark:border-white/5 pt-4 space-y-3 mt-4">
                <span className="text-xs font-bold text-customGray block">Add New Address</span>
                <div>
                  <input
                    type="text"
                    placeholder="Street Address, Block..."
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="ZIP/Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full bg-customGray-light dark:bg-black/30 text-sm rounded-xl p-2.5 border border-transparent focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 select-none">
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl text-xs font-bold shadow"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Payment details selection */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm select-none">
            <h3 className="font-extrabold text-base mb-4 flex items-center gap-2"><FiCreditCard className="text-primary" /> Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                }`}
              >
                <div className="text-xs leading-normal">
                  <p className="font-bold text-secondary dark:text-white">Cash on Delivery (COD)</p>
                  <p className="text-customGray font-medium mt-0.5">Pay in cash upon physical delivery.</p>
                </div>
                {paymentMethod === 'COD' && <span className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>

              {/* Razorpay gateway preparation */}
              <div
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-customGray-light dark:border-white/10 hover:border-customGray'
                }`}
              >
                <div className="text-xs leading-normal">
                  <p className="font-bold text-secondary dark:text-white">Online Payment (Razorpay)</p>
                  <p className="text-customGray font-medium mt-0.5">UPI, Cards, NetBanking. (Integrations ready)</p>
                </div>
                {paymentMethod === 'Razorpay' && <span className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - SUMMARY SUMMARY & COUPONS */}
        <div className="w-full lg:w-1/3 space-y-6 text-left select-none">
          
          {/* Coupon Entry */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-sm mb-3 flex items-center gap-1.5"><FiGift className="text-primary" /> Apply Coupon</h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMOCODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-grow bg-customGray-light/80 dark:bg-black/35 text-xs font-bold rounded-xl py-2.5 px-3 focus:outline-none uppercase"
                disabled={!!appliedCoupon}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-white dark:bg-primary dark:text-black rounded-xl text-xs font-bold shadow hover:bg-secondary/95 transition-all disabled:opacity-50"
                disabled={!!appliedCoupon}
              >
                Apply
              </button>
            </form>
            {appliedCoupon && (
              <div className="mt-3 flex justify-between items-center bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl text-xs">
                <span className="font-bold text-primary">{appliedCoupon.code} Applied</span>
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setDiscountAmount(0);
                    setCouponCode('');
                  }}
                  className="text-red-500 font-bold hover:underline text-[10px]"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Checkout Totals summary */}
          <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-[32px] p-6 shadow-sm">
            <h3 className="font-extrabold text-base text-secondary dark:text-white mb-6 border-b pb-3">Order Details</h3>
            
            {/* items list mini */}
            <div className="space-y-3 mb-6 max-h-40 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-customGray font-semibold truncate w-36">{item.product?.title} <span className="text-[10px] text-customGray">x{item.quantity}</span></span>
                  <span className="font-bold text-secondary dark:text-white">₹{((item.product?.price * (1 - item.product?.discount / 100)) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-xs font-semibold text-customGray mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-secondary dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Coupon Discount</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span className="text-secondary dark:text-white">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-secondary dark:text-white">{shippingCharges === 0 ? 'Free' : `₹${shippingCharges.toFixed(2)}`}</span>
              </div>
              <hr className="border-customGray-light dark:border-white/5" />
              <div className="flex justify-between text-base font-black text-secondary dark:text-white">
                <span>Total Amount</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl flex items-center justify-center gap-2 shadow transition-all disabled:opacity-50"
            >
              {placingOrder ? 'Processing...' : `Place Order (₹${grandTotal.toFixed(0)})`}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Checkout;
