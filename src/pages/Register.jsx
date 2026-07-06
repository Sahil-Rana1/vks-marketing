import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { setOtpVerificationEmail } from '../redux/authSlice.js';
import API from '../services/api.js';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      phone: Yup.string().matches(/^(?:\+91|91|0)?[6-9]\d{9}$/, 'Invalid mobile number (enter 10 digits, e.g., 9876543210)').required('Phone number is required')
    }),
    onSubmit: async (values) => {
      try {
        const res = await API.post('/auth/register', values);
        if (res.data.success) {
          showToast(res.data.message, 'success');
          dispatch(setOtpVerificationEmail(values.email));
          navigate('/verify-otp');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || error.toString();
        showToast(errorMsg, 'error');
      }
    }
  });

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 select-none">
      <div className="max-w-4xl w-full bg-white dark:bg-[#131722] border border-gray-200/80 dark:border-white/5 rounded-[36px] shadow-sm overflow-hidden flex flex-col md:flex-row transition-colors duration-300 relative">
        
        {/* Left Side: Branding Panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary/5 to-orange-500/5 dark:from-[#0a0d14] dark:to-[#0e111a] p-8 md:p-12 flex flex-col justify-between items-start text-left relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group relative z-10">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary to-orange-500 hover:scale-105 transition-all duration-300 shadow flex items-center justify-center">
              <img src="/media__1782796237116.jpg" alt="VKS Logo" className="h-8 w-8 rounded-full object-contain" />
            </div>
            <span className="font-extrabold text-sm tracking-widest text-gray-900 dark:text-white uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VKS Marketing</span>
          </Link>

          {/* Core Copy */}
          <div className="space-y-4 my-10 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              VIP Customer Portal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-snug" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Join the Modern Household Movement.
            </h3>
            <p className="text-xs text-gray-405 dark:text-gray-500 leading-relaxed font-semibold">
              Create your VIP account to save shipping configurations, claim seasonal discount coupons, track order histories, and checkout instantly.
            </p>
          </div>

          {/* Quick Metrics / Trust Badges */}
          <div className="space-y-3 relative z-10 w-full">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Free Shipping above ₹500</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">100% Unbreakable ABS Plastic</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">7-Day Easy Replacement policy</p>
            </div>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-left relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Create Account</h2>
            <p className="text-xs text-gray-450 dark:text-gray-500 mt-1 font-semibold">Register to track orders and save shipping addresses.</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  {...formik.getFieldProps('name')}
                  className="w-full bg-[#F5F5F3] dark:bg-black/20 text-sm rounded-xl py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-[#131722] focus:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-300 text-gray-900 dark:text-white"
                />
                <FiUser className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-600 w-4 h-4" />
              </div>
              {formik.touched.name && formik.errors.name ? (
                <span className="text-[10px] text-red-500 font-bold block pt-0.5">{formik.errors.name}</span>
              ) : null}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  {...formik.getFieldProps('email')}
                  className="w-full bg-[#F5F5F3] dark:bg-black/20 text-sm rounded-xl py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-[#131722] focus:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-300 text-gray-900 dark:text-white"
                />
                <FiMail className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-600 w-4 h-4" />
              </div>
              {formik.touched.email && formik.errors.email ? (
                <span className="text-[10px] text-red-500 font-bold block pt-0.5">{formik.errors.email}</span>
              ) : null}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 block">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  {...formik.getFieldProps('phone')}
                  className="w-full bg-[#F5F5F3] dark:bg-black/20 text-sm rounded-xl py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-[#131722] focus:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-300 text-gray-900 dark:text-white"
                />
                <FiPhone className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-600 w-4 h-4" />
              </div>
              {formik.touched.phone && formik.errors.phone ? (
                <span className="text-[10px] text-red-500 font-bold block pt-0.5">{formik.errors.phone}</span>
              ) : null}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  {...formik.getFieldProps('password')}
                  className="w-full bg-[#F5F5F3] dark:bg-black/20 text-sm rounded-xl py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:border-primary/50 focus:bg-white dark:focus:bg-[#131722] focus:shadow-[0_0_15px_rgba(245,158,11,0.06)] transition-all duration-300 text-gray-900 dark:text-white"
                />
                <FiLock className="absolute left-3.5 top-4 text-gray-400 dark:text-gray-600 w-4 h-4" />
              </div>
              {formik.touched.password && formik.errors.password ? (
                <span className="text-[10px] text-red-500 font-bold block pt-0.5">{formik.errors.password}</span>
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary/95 text-black font-black rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all text-xs tracking-widest uppercase mt-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Sign Up
            </button>
          </form>

          <p className="text-xs text-gray-400 dark:text-gray-550 text-center mt-6 font-semibold">
            Already have an account? <Link to="/login" className="text-primary font-black hover:underline pl-1 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sign In</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
