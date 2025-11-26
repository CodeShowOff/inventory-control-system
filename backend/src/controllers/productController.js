// src/controllers/productController.js

const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Create a new product
 * POST /api/products 
 * Body: { name, sku, description?, category?, price?, quantity?, reorderLevel?, expiryDate?, costPrice? }
 */
exports.createProduct = async (req, res) => {
  try {
  const { name, sku, description, category, price, quantity, reorderLevel, supplier, expiryDate, costPrice } = req.body;

    // Basic validation
    if (!name || !sku) {
      return res.status(400).json({ error: 'Name and SKU are required.' });
    }

    if (price && price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative.' });
    }

    if (quantity && quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative.' });
    }

    if (costPrice && costPrice < 0) {
      return res.status(400).json({ error: 'Cost price cannot be negative.' });
    }

    // Check if SKU already exists (unique constraint)
    const existing = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'A product with this SKU already exists.' });
    }

    // If supplier is provided, validate it exists
    if (supplier) {
      if (!mongoose.Types.ObjectId.isValid(supplier)) {
        return res.status(400).json({ error: 'Invalid supplier ID.' });
      }
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
      reorderLevel: reorderLevel !== undefined ? reorderLevel : 10,
      supplier: supplier || null,
      expiryDate: expiryDate || null,
      costPrice: costPrice || 0
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }
    
    const updates = req.body;
    
    // Validate numeric fields
    if (updates.price !== undefined && updates.price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative.' });
    }
    if (updates.quantity !== undefined && updates.quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative.' });
    }
    if (updates.costPrice !== undefined && updates.costPrice < 0) {
      return res.status(400).json({ error: 'Cost price cannot be negative.' });
    }
    if (updates.reorderLevel !== undefined && updates.reorderLevel < 0) {
      return res.status(400).json({ error: 'Reorder level cannot be negative.' });
    }
    
    // If supplier is provided, validate it exists
    if (updates.supplier) {
      if (!mongoose.Types.ObjectId.isValid(updates.supplier)) {
        return res.status(400).json({ error: 'Invalid supplier ID.' });
      }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }
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

/**
 * Get low stock products
 * GET /api/products/alerts/low-stock
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('supplier', 'name contactEmail phone');
    
    // Filter products where quantity is at or below reorder level
    const lowStockProducts = products.filter(p => {
      const reorderLevel = p.reorderLevel || 10;
      return p.quantity <= reorderLevel;
    });

    return res.json(lowStockProducts);
  } catch (err) {
    console.error('Get low stock products error:', err);
    return res.status(500).json({ error: 'Server error while fetching low stock products.' });
  }
};
