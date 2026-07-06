import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid,
  FiBox,
  FiLayers,
  FiPercent,
  FiShoppingBag,
  FiMessageSquare,
  FiMail,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiSun,
  FiMoon,
  FiSettings
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { logoutAdmin } from '../redux/authSlice.js';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { isAdminAuthenticated, admin } = useSelector((state) => state.auth);

  // Auth Guard check: redirect to admin login if not authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleAdminLogout = () => {
    dispatch(logoutAdmin());
    showToast('Admin logged out successfully', 'info');
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: <FiGrid /> },
    { name: 'Products Catalog', path: '/admin/products', icon: <FiBox /> },
    { name: 'Categories Manager', path: '/admin/categories', icon: <FiLayers /> },
    { name: 'Coupons Registry', path: '/admin/coupons', icon: <FiPercent /> },
    { name: 'Orders Dashboard', path: '/admin/orders', icon: <FiShoppingBag /> },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: <FiMessageSquare /> },
    { name: 'Newsletter List', path: '/admin/newsletter', icon: <FiMail /> },
    { name: 'Site Customizer', path: '/admin/customize', icon: <FiSettings /> }
  ];

  if (!isAdminAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-bgLight dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bgLight dark:bg-black text-secondary dark:text-white overflow-hidden">
      
      {/* Admin Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isSidebarOpen ? 260 : 70 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="hidden md:flex flex-col bg-secondary text-white border-r border-white/5 flex-shrink-0"
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          {isSidebarOpen ? (
            <span className="font-extrabold text-lg tracking-wider">
              VKS <span className="text-primary font-medium">Dashboard</span>
            </span>
          ) : (
            <span className="font-black text-primary text-xl mx-auto">V</span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-customGray hover:text-white"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-grow py-4 px-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-black font-semibold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {isSidebarOpen && <span className="text-sm truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <FiLogOut className="text-lg" />
            {isSidebarOpen && <span className="text-sm font-semibold">Admin Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Admin View Container */}
      <div className="flex flex-col flex-grow h-full overflow-hidden">
        
        {/* Top bar header */}
        <header className="h-16 border-b border-customGray-light dark:border-white/5 bg-white dark:bg-customGray-dark px-6 flex justify-between items-center z-10 select-none">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-customGray-light dark:hover:bg-black/20 rounded-lg"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold">VKS Marketing Panel</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {/* Custom Sliding Segmented Theme Switch */}
            <div
              onClick={toggleTheme}
              className="relative flex items-center bg-gray-100 dark:bg-black/40 p-1 rounded-full border border-gray-250/50 dark:border-white/5 select-none w-28 h-9 cursor-pointer transition-all duration-300"
            >
              {/* Sliding Indicator Panel */}
              <div
                className={`absolute top-1 bottom-1 w-[50px] bg-primary rounded-full transition-all duration-300 shadow-md ${
                  isDark ? 'left-[54px]' : 'left-[4px]'
                }`}
              />
              
              {/* Light mode Label */}
              <span className={`w-[50px] flex items-center justify-center gap-1 z-10 text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                isDark ? 'text-gray-400 dark:text-gray-550' : 'text-black'
              }`}>
                <FiSun className="w-3 h-3 animate-pulse" />
                Light
              </span>

              {/* Dark mode Label */}
              <span className={`w-[50px] flex items-center justify-center gap-1 z-10 text-[9px] font-black uppercase tracking-wider transition-colors duration-300 ${
                isDark ? 'text-black' : 'text-gray-400 dark:text-gray-550'
              }`}>
                <FiMoon className="w-3 h-3" />
                Dark
              </span>
            </div>

            {/* Admin identity */}
            <div className="flex items-center gap-2 border-l border-customGray-light dark:border-white/5 pl-4">
              <div className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center text-xs shadow-sm">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-customGray">Administrator</p>
                <p className="text-xs font-semibold">{admin?.name || 'VKS Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard view viewport */}
        <main className="flex-grow p-6 overflow-y-auto bg-bgLight dark:bg-black/95">
          <Outlet />
        </main>

      </div>

      {/* Mobile Drawer Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-secondary text-white z-50 p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="font-extrabold text-lg tracking-wider text-white">
                  VKS <span className="text-primary font-medium">Marketing</span>
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-white/5"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 overflow-y-auto flex-grow">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary text-black font-semibold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-white/5 pt-4">
                <button
                  onClick={handleAdminLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <FiLogOut className="text-lg" />
                  <span className="text-sm font-semibold">Admin Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminLayout;
