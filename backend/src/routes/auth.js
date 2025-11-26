// src/routes/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
 
// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me
// Protected route: returns the current authenticated user's data (no password)
router.get('/me', authMiddleware, (req, res) => {
  // req.user is set by authMiddleware and already has password excluded
  return res.json({ user: req.user });
});

module.exports = router;