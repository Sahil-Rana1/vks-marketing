import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiMail, FiLock, FiLock as FiShield } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { authStart, adminAuthSuccess, authFailure } from '../redux/authSlice.js';
import API from '../services/api.js';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      try {
        dispatch(authStart());
        const res = await API.post('/auth/admin/login', values);
        if (res.data.success) {
          dispatch(adminAuthSuccess({ admin: res.data.admin, token: res.data.token }));
          showToast('Welcome to VKS Marketing Management Console', 'success');
          navigate('/admin');
        }
      } catch (error) {
        dispatch(authFailure(error.toString()));
        showToast(error.toString(), 'error');
      }
    }
  });

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-black text-white px-4 select-none font-sans">
      
      {/* Brand logo */}
      <div className="mb-8 text-center select-none">
        <span className="font-extrabold text-3xl tracking-widest text-white flex items-center justify-center">
          VKS<span className="text-primary font-medium ml-1">Marketing</span>
        </span>
        <p className="text-[10px] text-customGray font-bold uppercase tracking-widest mt-1.5">Management Console</p>
      </div>

      <div className="bg-secondary/40 border border-white/5 rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl text-left glassmorphism">
        <h2 className="text-xl font-black mb-1.5 flex items-center gap-2"><FiShield className="text-primary" /> Admin Login</h2>
        <p className="text-xs text-customGray font-semibold mb-6">Access restricted to authorized VKS support staff.</p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                {...formik.getFieldProps('email')}
                className="w-full bg-black/40 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-white/10 focus:outline-none focus:border-primary/50 text-white"
              />
              <FiMail className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <span className="text-[10px] text-red-500 font-semibold">{formik.errors.email}</span>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">Security Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                {...formik.getFieldProps('password')}
                className="w-full bg-black/40 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-white/10 focus:outline-none focus:border-primary/50 text-white"
              />
              <FiLock className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <span className="text-[10px] text-red-500 font-semibold">{formik.errors.password}</span>
            ) : null}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-black font-extrabold rounded-2xl shadow-lg transition-all mt-4"
          >
            Authenticate Console
          </button>
        </form>

        <div className="mt-6 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-customGray leading-normal">
            Default credentials for testing:<br />
            Email: <span className="text-gray-300 font-semibold">admin@vksmarketing.com</span><br />
            Pass: <span className="text-gray-300 font-semibold">Admin@VKS2026</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
