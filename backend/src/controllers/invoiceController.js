const Invoice = require('../models/Invoice');
const Product = require('../models/Product');

// Create a new invoice and decrement product stock
exports.createInvoice = async (req, res) => {
  try {
    const { customerName, items, tax } = req.body;
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Customer name and items are required.' });
    }

    let total = 0;
    // Validate products and calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.product}` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }
      total += item.price * item.quantity;
    }

    // Decrement stock
    for (const item of items) {
      await Product.adjustQuantity(item.product, -item.quantity);
    }

    const invoice = new Invoice({
      customerName,
      items,
      total,
      tax: tax || 0,
      paid: false
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
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
    const invoice = await Invoice.findById(req.params.id).populate('items.product', 'name sku');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark invoice as paid
exports.markInvoicePaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { paid: true }, { new: true });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
