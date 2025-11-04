const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    const { supplier, items } = req.body;
    if (!supplier || !items || !items.length) {
      return res.status(400).json({ error: 'Supplier and items are required.' });
    }
    const order = new PurchaseOrder({ supplier, items });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
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
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Order already processed' });
    // Add stock for each item
    for (const item of order.items) {
      await Product.adjustQuantity(item.product, item.quantity);
    }
    order.status = 'received';
    order.receivedAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
