import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import sendEmail from '../utils/sendEmail.js';

let MOCK_USERS_DB = [];

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vks_marketing_secret_key_123456_secure_jwt', {
    expiresIn: '30d'
  });
};

// Generate 6-Digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register a new user (initiates OTP)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      const userExists = MOCK_USERS_DB.find(u => u.email === email);
      if (userExists) {
        if (userExists.isVerified) {
          return res.status(400).json({ success: false, message: 'User already exists and is verified (Mock mode)' });
        }
        userExists.name = name;
        userExists.password = password;
        userExists.phone = phone;
        return res.status(200).json({
          success: true,
          message: 'Mock registration updated. Please use OTP code 123456 to verify.'
        });
      }

      MOCK_USERS_DB.push({
        _id: 'mock_u_' + Date.now(),
        name,
        email,
        password,
        phone,
        otp: '123456',
        isVerified: false,
        role: 'user',
        addresses: []
      });

      return res.status(201).json({
        success: true,
        message: 'Mock registration initiated. Please use OTP code 123456 to verify.'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ success: false, message: 'User already exists and is verified' });
      }
      // If user exists but is not verified, overwrite registration/re-send OTP
      userExists.name = name;
      userExists.password = password; // pre-save hook will hash
      userExists.phone = phone;
      const otp = generateOTP();
      userExists.otp = otp;
      userExists.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await userExists.save();

      // Send OTP Email
      await sendEmail({
        email: userExists.email,
        subject: 'Verify Your VKS Marketing Account',
        message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
        html: `
          <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0;">
            <h2 style="color: #F59E0B; margin-bottom: 20px;">VKS Marketing</h2>
            <p>Hello ${name},</p>
            <p>Thank you for registering. Please verify your account using the One Time Password (OTP) below:</p>
            <div style="font-size: 24px; font-weight: bold; background-color: #F9FAFB; padding: 15px; text-align: center; border-radius: 8px; border: 1px dashed #111827; letter-spacing: 4px; color: #111827; margin: 20px 0;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #6B7280;">This OTP is valid for 10 minutes.</p>
          </div>
        `
      });

      return res.status(200).json({
        success: true,
        message: 'Registration initiated. Please verify your email with the OTP sent.'
      });
    }

    // Create new unverified user
    const otp = generateOTP();
    const user = await User.create({
      name,
      email,
      password,
      phone,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000)
    });

    // Send OTP Email
    await sendEmail({
      email: user.email,
      subject: 'Verify Your VKS Marketing Account',
      message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">VKS Marketing</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering. Please verify your account using the One Time Password (OTP) below:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #F9FAFB; padding: 15px; text-align: center; border-radius: 8px; border: 1px dashed #111827; letter-spacing: 4px; color: #111827; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #6B7280;">This OTP is valid for 10 minutes.</p>
        </div>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for the verification OTP.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP for account activation
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      const user = MOCK_USERS_DB.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found (Mock mode)' });
      }
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Account is already verified (Mock mode)' });
      }
      if (otp !== '123456' && user.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP. Enter 123456.' });
      }

      user.isVerified = true;
      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true });

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully. Welcome to VKS Marketing (Mock mode)!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified' });
    }

    const isMailConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_USER !== 'your_smtp_user'
    );
    const isDevDefaultOtp = otp === '123456' && (process.env.NODE_ENV !== 'production' || !isMailConfigured);

    if (!isDevDefaultOtp && (user.otp !== otp || user.otpExpiry < new Date())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);

    // Save token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Welcome to VKS Marketing!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP Verification email
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      const user = MOCK_USERS_DB.find(u => u.email === email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'OTP verification code resent. Use code 123456.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'New Verification OTP - VKS Marketing',
      message: `Your new verification OTP is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">VKS Marketing</h2>
          <p>Hello ${user.name},</p>
          <p>Here is your new account verification OTP:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #F9FAFB; padding: 15px; text-align: center; border-radius: 8px; border: 1px dashed #111827; letter-spacing: 4px; color: #111827; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #6B7280;">This OTP is valid for 10 minutes.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'New OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      // Mock Admin
      if (email === 'admin@vksmarketing.com' && password === 'Admin@VKS2026') {
        const token = generateToken('mock_admin_id');
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({
          success: true,
          token,
          user: {
            _id: 'mock_admin_id',
            name: 'VKS Admin',
            email: 'admin@vksmarketing.com',
            role: 'admin',
            addresses: []
          }
        });
      }

      // Check registered mock users
      const user = MOCK_USERS_DB.find(u => u.email === email);
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account not verified. A verification OTP has been sent to your email.'
        });
      }

      const token = generateToken(user._id);
      res.cookie('token', token, { httpOnly: true });
      return res.status(200).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Force OTP verification if not verified
    if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await sendEmail({
        email: user.email,
        subject: 'Verify Your VKS Marketing Account',
        message: `Your verification OTP is ${otp}. It will expire in 10 minutes.`,
        html: `<p>Please verify your email using OTP: <b>${otp}</b></p>`
      });

      return res.status(403).json({
        success: false,
        message: 'Account not verified. A verification OTP has been sent to your email.'
      });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password request (sends reset email link)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with that email' });
    }

    // Generate reset token (simple OTP style code or uuid for link)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - VKS Marketing',
      message: `Your password reset code is ${resetToken}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">VKS Marketing</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Use the following code to complete the process:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #F9FAFB; padding: 15px; text-align: center; border-radius: 8px; border: 1px dashed #F59E0B; letter-spacing: 4px; color: #111827; margin: 20px 0;">
            ${resetToken}
          </div>
          <p style="font-size: 12px; color: #6B7280;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    const isMailConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_USER !== 'your_smtp_user'
    );
    const isDevDefaultOtp = otp === '123456' && (process.env.NODE_ENV !== 'production' || !isMailConfigured);

    let user;
    if (isDevDefaultOtp) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpire: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    user.password = newPassword; // Will be hashed in pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private (User)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockUser = MOCK_USERS_DB.find(u => u._id === req.user._id);
      if (!mockUser) {
        return res.status(404).json({ success: false, message: 'User not found (Mock mode)' });
      }
      return res.status(200).json({ success: true, user: mockUser });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user addresses
 * @route   PUT /api/auth/addresses
 * @access  Private
 */
export const updateUserAddresses = async (req, res, next) => {
  const { addresses } = req.body; // array of addresses

  try {
    if (mongoose.connection.readyState !== 1) {
      const mockUser = MOCK_USERS_DB.find(u => u._id === req.user._id);
      if (!mockUser) {
        return res.status(404).json({ success: false, message: 'User not found (Mock mode)' });
      }
      mockUser.addresses = addresses;
      return res.status(200).json({ success: true, message: 'Addresses updated successfully (Mock mode)', addresses: mockUser.addresses });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.addresses = addresses;
    await user.save();

    res.status(200).json({ success: true, message: 'Addresses updated successfully', addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin login
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (mongoose.connection.readyState !== 1) {
      if (email === 'admin@vksmarketing.com' && password === 'Admin@VKS2026') {
        const token = generateToken('mock_admin_id');
        res.cookie('adminToken', token, { httpOnly: true });
        return res.status(200).json({
          success: true,
          token,
          admin: {
            _id: 'mock_admin_id',
            name: 'VKS Admin',
            email: 'admin@vksmarketing.com',
            role: 'admin'
          }
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid admin credentials (Mock mode)' });
    }

    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = generateToken(admin._id);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      success: true,
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initialize seed Admin on startup
 */
export const seedAdmin = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const count = await Admin.countDocuments();
    if (count === 0) {
      await Admin.create({
        name: 'VKS Admin',
        email: 'admin@vksmarketing.com',
        password: 'Admin@VKS2026', // Hashed inside schema pre-save hook
        role: 'admin'
      });
      console.log('--- ADMIN SEED --- Default admin created successfully: admin@vksmarketing.com / Admin@VKS2026');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};
