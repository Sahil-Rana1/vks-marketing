import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// Layout wrappers
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Redux Actions
import { authSuccess, logout } from './redux/authSlice.js';
import { setCart } from './redux/cartSlice.js';
import { setWishlist } from './redux/wishlistSlice.js';
import { setCategories } from './redux/productSlice.js';
import API from './services/api.js';

// Lazy loading customer pages
const Home = lazy(() => import('./pages/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderHistory = lazy(() => import('./pages/OrderHistory.jsx'));
const OrderDetails = lazy(() => import('./pages/OrderDetails.jsx'));
const UserProfile = lazy(() => import('./pages/UserProfile.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const VerifyOtp = lazy(() => import('./pages/VerifyOtp.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));

// Static policy pages
const About = lazy(() => import('./pages/About.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy.jsx'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));

// Lazy loading admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const DashboardOverview = lazy(() => import('./pages/DashboardOverview.jsx'));
const AdminProducts = lazy(() => import('./pages/AdminProducts.jsx'));
const AdminCategories = lazy(() => import('./pages/AdminCategories.jsx'));
const AdminCoupons = lazy(() => import('./pages/AdminCoupons.jsx'));
const AdminOrders = lazy(() => import('./pages/AdminOrders.jsx'));
const AdminMessages = lazy(() => import('./pages/AdminMessages.jsx'));
const AdminSubscribers = lazy(() => import('./pages/AdminSubscribers.jsx'));
const AdminCustomize = lazy(() => import('./pages/AdminCustomize.jsx'));

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // 1. Check user validation and initialize state on app load
  useEffect(() => {
    const initApp = async () => {
      const storedToken = localStorage.getItem('vks_token');
      if (storedToken) {
        try {
          const profileRes = await API.get('/auth/profile');
          if (profileRes.data.success) {
            dispatch(authSuccess({ user: profileRes.data.user, token: storedToken }));
          }
        } catch (error) {
          console.error('Session expired or profile failed:', error);
          dispatch(logout());
        }
      }
    };
    initApp();
  }, [dispatch]);

  // 2. Fetch categories catalog on load (for navbar and search options)
  useEffect(() => {
    const fetchCategoriesList = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          dispatch(setCategories(res.data));
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategoriesList();
  }, [dispatch]);

  // 3. Fetch user cart & wishlist upon authentication success
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          // Get Cart
          const cartRes = await API.get('/cart');
          if (cartRes.data.success) {
            dispatch(setCart(cartRes.data.cart));
          }
          // Get Wishlist
          const wishlistRes = await API.get('/wishlist');
          if (wishlistRes.data.success) {
            dispatch(setWishlist(wishlistRes.data.wishlist));
          }
        } catch (error) {
          console.error('Failed to fetch user shopping metrics:', error);
        }
      }
    };
    fetchUserData();
  }, [isAuthenticated, dispatch, token]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="h-screen w-screen flex flex-col justify-center items-center bg-white dark:bg-[#0A0D14] transition-colors duration-300 select-none">
              <div className="relative flex items-center justify-center w-24 h-24">
                {/* Outer spinning rings */}
                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-t-primary border-b-primary border-l-transparent border-r-transparent" />
                {/* Centered logo image */}
                <img
                  src="/media__1782796237116.jpg"
                  alt="VKS Logo"
                  className="w-16 h-16 rounded-full object-contain border border-gray-200/50 dark:border-white/5 shadow-inner"
                />
              </div>
              <div className="text-center mt-6 space-y-1">
                <p className="text-xs font-black tracking-widest text-gray-900 dark:text-white uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  VKS Marketing
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-550 font-bold uppercase tracking-wider">
                  Elevating Home Essentials
                </p>
              </div>
            </div>
          }
        >
          <Routes>
            {/* Customer Facing Site */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="orders/:id" element={<OrderDetails />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify-otp" element={<VerifyOtp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              
              {/* Policies */}
              <Route path="about" element={<About />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="refund-policy" element={<RefundPolicy />} />
              <Route path="shipping-policy" element={<ShippingPolicy />} />
              <Route path="terms" element={<Terms />} />
            </Route>

            {/* Admin Dashboard Area */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="newsletter" element={<AdminSubscribers />} />
              <Route path="customize" element={<AdminCustomize />} />
            </Route>

            {/* Standalone Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
