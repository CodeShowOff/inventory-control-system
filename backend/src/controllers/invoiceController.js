const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create a new invoice and decrement product stock
exports.createInvoice = async (req, res) => {
  try {
    const { customerName, items, tax } = req.body;
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and items are required.' });
    }

    let subtotal = 0;
    // Validate products and calculate subtotal
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.product}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number.' });
      }
      if (item.price === undefined || item.price === null || item.price < 0) {
        return res.status(400).json({ error: 'Invalid price for item.' });
      }
      subtotal += item.price * item.quantity;
    }

    // Calculate tax amount and total
    const taxValue = Number(tax) || 0;
    let taxAmount = 0;
    if (taxValue > 0 && taxValue <= 100) {
      // Treat as percentage
      taxAmount = subtotal * (taxValue / 100);
    } else if (taxValue > 100) {
      // Treat as absolute amount
      taxAmount = taxValue;
    }
    const total = subtotal + taxAmount;

    // Decrement stock
    for (const item of items) {
      await Product.adjustQuantity(item.product, -item.quantity);
    }

    const invoice = new Invoice({
      customerName,
      items,
      subtotal,
      tax: taxValue,
      taxAmount,
      total,
      paid: false
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).populate('items.product', 'name sku');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID.' });
    }
    const invoice = await Invoice.findById(req.params.id).populate('items.product', 'name sku');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('Get invoice by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mark invoice as paid
exports.markInvoicePaid = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID.' });
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { paid: true }, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('Mark invoice paid error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID.' });
    }
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Restore stock for each item
    for (const item of invoice.items) {
      try {
        await Product.adjustQuantity(item.product, item.quantity);
      } catch (err) {
        console.error(`Failed to restore stock for product ${item.product}:`, err.message);
      }
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted and stock restored' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ error: err.message });
  }
};
