// src/middlewares/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Auth middleware
 * - Expects header: Authorization: Bearer <token>
 * - Verifies token and attaches user object to req.user (without password)
 */
module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // payload should contain at least the user id
    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Optionally, fetch fresh user from DB (so we have latest role, etc.)
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found for token' });
    }

    // Attach user to request for later handlers
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Server error in auth middleware' });
  }
};
