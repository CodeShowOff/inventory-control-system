const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

exports.createOrder = async (req, res) => {
  try {
    const { supplier, items } = req.body;
    if (!supplier || !items || !items.length) {
      return res.status(400).json({ error: 'Supplier and items are required.' });
    }
    // Validate supplier exists
    if (!mongoose.Types.ObjectId.isValid(supplier)) {
      return res.status(400).json({ error: 'Invalid supplier ID.' });
    }
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }
    // Validate all products exist
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ error: 'Invalid product ID.' });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive number.' });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product}` });
      }
    }
    const order = new PurchaseOrder({ supplier, items });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().populate('supplier', 'name').populate('items.product', 'name sku');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.receiveOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }
    // Add stock for each item
    for (const item of order.items) {
      try {
        await Product.adjustQuantity(item.product, item.quantity);
      } catch (err) {
        console.error(`Failed to add stock for product ${item.product}:`, err.message);
        return res.status(400).json({ error: `Failed to add stock: ${err.message}` });
      }
    }
    order.status = 'received';
    order.receivedAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    console.error('Receive order error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID.' });
    }
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: err.message });
  }
};
