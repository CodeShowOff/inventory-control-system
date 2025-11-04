// src/controllers/productController.js

const Product = require('../models/Product');

/**
 * Create a new product
 * POST /api/products
 * Body: { name, sku, description?, category?, price?, quantity?, reorderLevel? }
 */
exports.createProduct = async (req, res) => {
  try {
  const { name, sku, description, category, price, quantity, supplier } = req.body;

    // Basic validation
    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required.' });
    }

    // Check if SKU already exists (unique constraint)
    const existing = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'A product with this SKU already exists.' });
    }

    // If supplier is provided, validate it exists
    if (supplier) {
      const Supplier = require('../models/Supplier');
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(400).json({ error: 'Supplier not found.' });
      }
    }

    const newProduct = new Product({
      name: name.trim(),
      sku: sku.toUpperCase().trim(),
      description,
      category,
      price,
      quantity,
      supplier: supplier || null
    });

    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({ error: 'Server error while creating product.' });
  }
};

/**
 * Get all products
 * GET /api/products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('supplier', 'name contactEmail phone address');
    return res.json(products);
  } catch (err) {
    console.error('Get all products error:', err);
    return res.status(500).json({ error: 'Server error while fetching products.' });
  }
};

/**
 * Get a single product by ID
 * GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name contactEmail phone address');
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    return res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    return res.status(500).json({ error: 'Server error while fetching product.' });
  }
};

/**
 * Update a product by ID
 * PUT /api/products/:id
 */
exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    // If supplier is provided, validate it exists
    if (updates.supplier) {
      const Supplier = require('../models/Supplier');
      const supplierExists = await Supplier.findById(updates.supplier);
      if (!supplierExists) {
        return res.status(400).json({ error: 'Supplier not found.' });
      }
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    return res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({ error: 'Server error while updating product.' });
  }
};

/**
 * Delete a product
 * DELETE /api/products/:id
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    return res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({ error: 'Server error while deleting product.' });
  }
};

/**
 * Add stock (Stock IN)
 * POST /api/products/:id/add-stock
 * Body: { quantity }
 */
exports.addStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' });
    }

    const updated = await Product.adjustQuantity(req.params.id, +quantity);
    return res.json({ message: 'Stock added successfully.', product: updated });
  } catch (err) {
    console.error('Add stock error:', err);
    return res.status(400).json({ error: err.message });
  }
};

/**
 * Remove stock (Stock OUT)
 * POST /api/products/:id/remove-stock
 * Body: { quantity }
 */
exports.removeStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number.' });
    }

    const updated = await Product.adjustQuantity(req.params.id, -quantity);
    return res.json({ message: 'Stock removed successfully.', product: updated });
  } catch (err) {
    console.error('Remove stock error:', err);
    return res.status(400).json({ error: err.message });
  }
};
