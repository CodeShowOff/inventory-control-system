const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, phone, address, notes } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Supplier name is required.' });
    }
    // Check for duplicate supplier name
    const existing = await Supplier.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: 'A supplier with this name already exists.' });
    }
    const supplier = new Supplier({ name: name.trim(), contactEmail, phone, address, notes });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Create supplier error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid supplier ID.' });
    }
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    console.error('Get supplier by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid supplier ID.' });
    }
    // Check for duplicate name if name is being updated
    if (req.body.name) {
      const existing = await Supplier.findOne({ 
        name: req.body.name.trim(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(409).json({ error: 'A supplier with this name already exists.' });
      }
    }
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    console.error('Update supplier error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid supplier ID.' });
    }
    // Check if any products reference this supplier
    const productsWithSupplier = await Product.countDocuments({ supplier: req.params.id });
    if (productsWithSupplier > 0) {
      return res.status(400).json({ 
        error: `Cannot delete supplier. ${productsWithSupplier} product(s) are associated with this supplier. Please reassign or delete those products first.` 
      });
    }
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    console.error('Delete supplier error:', err);
    res.status(500).json({ error: err.message });
  }
};
