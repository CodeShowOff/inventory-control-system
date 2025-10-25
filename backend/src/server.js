// src/server.js

// --- Load environment variables from .env file ---
require('dotenv').config();

// --- Import packages ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Create Express app ---
const app = express();

// --- Middlewares ---
// 1) Parse JSON bodies (req.body)
app.use(express.json());
// 2) Enable CORS so your frontend (running on another port) can call this API
app.use(cors());


// --- Mount routes ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


// --- Basic route to check server is running ---
app.get('/', (req, res) => {
  res.json({ message: 'Inventory backend is running' });
});


// --- Connect to MongoDB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';
mongoose.connect(MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1); // stop the app if DB connection fails
});

// --- Start the server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
