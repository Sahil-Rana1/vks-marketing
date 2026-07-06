import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShield } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.jsx';
import { authSuccess } from '../redux/authSlice.js';
import API from '../services/api.js';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { otpVerificationEmail } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);

  // Redirect to login if email is missing
  useEffect(() => {
    if (!otpVerificationEmail) {
      navigate('/login');
    }
  }, [otpVerificationEmail, navigate]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP code', 'warning');
      return;
    }

    try {
      const res = await API.post('/auth/verify-otp', {
        email: otpVerificationEmail,
        otp
      });
      if (res.data.success) {
        dispatch(authSuccess({ user: res.data.user, token: res.data.token }));
        showToast('Email verified successfully! Welcome to VKS Marketing.', 'success');
        navigate('/');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || error.toString();
      showToast(errorMsg, 'error');
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await API.post('/auth/resend-otp', { email: otpVerificationEmail });
      if (res.data.success) {
        showToast('Verification code resent to your email!', 'success');
        setTimer(60);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || error.toString();
      showToast(errorMsg, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 select-none">
      <div className="bg-white dark:bg-customGray-dark border border-customGray-light dark:border-white/5 rounded-[32px] p-6 sm:p-8 shadow-md text-left select-none">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl mb-4">
          <FiShield />
        </div>
        <h2 className="text-2xl font-black text-secondary dark:text-white mb-2">Verify Account</h2>
        <p className="text-xs text-customGray font-semibold leading-relaxed mb-6">
          We have sent a 6-digit verification code to <span className="text-secondary dark:text-white font-bold">{otpVerificationEmail}</span>.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-customGray block mb-2">Enter Verification Code (OTP)</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-2xl font-black tracking-[10px] bg-customGray-light dark:bg-black/35 rounded-xl py-3 border border-transparent focus:outline-none focus:border-primary/50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-secondary text-white dark:bg-primary dark:text-black rounded-2xl font-bold text-sm shadow transition-all"
          >
            Verify and Login
          </button>
        </form>

        <div className="mt-6 border-t border-customGray-light dark:border-white/5 pt-4 text-center">
          <p className="text-[10px] text-customGray leading-relaxed font-semibold">
            <strong>Development Assistant:</strong><br />
            Since SMTP mailer is disabled in local testing, check your backend server console logs for the printed OTP, or use default code <span className="text-secondary dark:text-white font-extrabold bg-primary/20 px-1 rounded">123456</span> to verify immediately!
          </p>
        </div>

        <div className="mt-6 text-center select-none">
          {timer > 0 ? (
            <p className="text-xs text-customGray font-semibold">Resend OTP code in {timer}s</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-primary font-bold hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
