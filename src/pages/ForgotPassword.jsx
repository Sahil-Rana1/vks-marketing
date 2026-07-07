import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1); // 1: Email, 2: Reset Form
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setSubmitting(true);
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setStep(2);
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        navigate('/login');
      }
    } catch (error) {
      showToast(error.toString(), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 select-none">
      <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-[32px] p-6 sm:p-8 shadow-md text-left select-none">
        
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-black text-secondary dark:text-white mb-2">Forgot Password?</h2>
            <p className="text-xs text-customGray font-semibold mb-6">Enter your registered email address to receive a verification code.</p>

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/35 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-transparent focus:outline-none focus:border-primary/50"
                    required
                  />
                  <FiMail className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl shadow transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? 'Sending...' : 'Request Code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-secondary dark:text-white mb-2">Reset Password</h2>
            <p className="text-xs text-customGray font-semibold mb-6">
              Enter the 6-digit reset code sent to <span className="text-secondary dark:text-white font-bold">{email}</span>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Reset Code (OTP)</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-customGray-light dark:bg-black/35 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-transparent focus:outline-none focus:border-primary/50"
                    required
                  />
                  <FiShield className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-customGray block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/35 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-transparent focus:outline-none focus:border-primary/50"
                    required
                  />
                  <FiLock className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-customGray block mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-customGray-light dark:bg-black/35 text-sm rounded-xl py-2.5 pl-9 pr-3 border border-transparent focus:outline-none focus:border-primary/50"
                    required
                  />
                  <FiLock className="absolute left-3 top-3.5 text-customGray w-3.5 h-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary/95 text-black font-bold rounded-2xl shadow transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? 'Resetting...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 border-t border-customGray-light dark:border-white/5 pt-4 text-center">
              <p className="text-[10px] text-customGray leading-relaxed font-semibold">
                <strong>Development Assistant:</strong><br />
                Since SMTP mailer is disabled in local testing, check your backend server console logs for the reset code, or use default code <span className="text-secondary dark:text-white font-extrabold bg-primary/20 px-1 rounded">123456</span> to reset immediately!
              </p>
            </div>
          </>
        )}

        <p className="text-xs text-customGray text-center mt-6">
          Remember your password? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
