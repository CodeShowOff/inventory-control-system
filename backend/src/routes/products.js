// src/routes/products.js

const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/auth'); // we’ll protect routes with JWT

// ✅ All routes below are protected 
router.use(authMiddleware);

// GET /api/products/alerts/low-stock → Get low stock products (must come before /:id)
router.get('/alerts/low-stock', productController.getLowStockProducts);

// POST /api/products  → Create new product
router.post('/', productController.createProduct);

// GET /api/products  → Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id  → Get single product
router.get('/:id', productController.getProductById);

// PUT /api/products/:id  → Update product
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id  → Delete product
router.delete('/:id', productController.deleteProduct);



// POST /api/products/:id/add-stock → Add stock
router.post('/:id/add-stock', productController.addStock);

// POST /api/products/:id/remove-stock → Remove stock
router.post('/:id/remove-stock', productController.removeStock);

module.exports = router;
