import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  let token;

  // Read token from Authorization header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vks_marketing_secret_key_123456_secure_jwt');

    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id,
        name: decoded.id === 'mock_admin_id' ? 'VKS Admin' : 'Test Customer',
        email: decoded.id === 'mock_admin_id' ? 'admin@vksmarketing.com' : 'test@example.com',
        role: decoded.id === 'mock_admin_id' ? 'admin' : 'user',
        addresses: []
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      return next();
    }

    // Check if user is an admin (in case admin calls user APIs)
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.user = admin; // Assign to req.user for general access
      return next();
    }

    return res.status(401).json({ success: false, message: 'User not found, authorization failed' });
  } catch (error) {
    console.error('Auth protect middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

export const adminOnly = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin access denied, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vks_marketing_secret_key_123456_secure_jwt');

    if (mongoose.connection.readyState !== 1) {
      if (decoded.id === 'mock_admin_id') {
        req.admin = {
          _id: 'mock_admin_id',
          name: 'VKS Admin',
          email: 'admin@vksmarketing.com',
          role: 'admin'
        };
        return next();
      }
      return res.status(403).json({ success: false, message: 'Access denied, administrator role required (Mock mode)' });
    }

    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, administrator role required' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin guard middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};
