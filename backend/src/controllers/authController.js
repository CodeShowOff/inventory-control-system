// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: remove sensitive fields before sending user object to client
function sanitizeUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password; // remove password hash
  return user;
}

// Create a signed JWT for a user
function createToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email
  };
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';
  const options = { expiresIn: '7d' }; // token valid for 7 days (adjust as needed)
  return jwt.sign(payload, secret, options);
}

// Controller: Register a new user
// Expects body: { name, email, password, role? }
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation (we'll add improved validation later)
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // Create & save user - password will be hashed by the pre('save') hook in User model
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role && role === 'admin' ? 'admin' : 'staff' // don't allow arbitrary roles from client
    });
    await user.save();

    // Create token and return sanitized user
    const token = createToken(user);
    return res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error while registering user.' });
  }
};

// Controller: Login existing user
// Expects body: { email, password }
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // do not reveal whether email exists — generic message
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = createToken(user);

    // Get low-stock products for alert
    const Product = require('../models/Product');
    const lowStockProducts = await Product.find({
      reorderLevel: { $gt: 0 },
      isActive: true
    }).select('name sku quantity reorderLevel');

    // Filter in-memory for products below reorder level
    const filteredLowStock = lowStockProducts.filter(p => p.quantity <= p.reorderLevel);

    return res.json({
      user: sanitizeUser(user),
      token,
      lowStockProducts: filteredLowStock
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error while logging in.' });
  }
};
