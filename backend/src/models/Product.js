// src/models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: 'general',
    index: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier', // we'll create Supplier model later
    default: null
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  expiryDate: {
    type: Date,
    default: null
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});

/**
 * Static helper: adjustQuantity
 * - Performs an atomic quantity update.
 * - `delta` can be positive (stock IN) or negative (stock OUT).
 * - If delta < 0, we ensure quantity never goes below zero by including a condition.
 * - Returns the updated product document (new: true) on success.
 * - Throws an Error if the operation would produce negative stock or product not found.
 *
 * Usage examples:
 *  await Product.adjustQuantity(productId, +10); // add 10
 *  await Product.adjustQuantity(productId, -3);  // remove 3 (will throw if insufficient)
 */
ProductSchema.statics.adjustQuantity = async function (productId, delta) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error('Invalid product id');
  }

  const Model = this;

  if (delta === 0) {
    const p = await Model.findById(productId);
    if (!p) throw new Error('Product not found');
    return p;
  }

  if (delta < 0) {
    // Decrease quantity: ensure we have enough stock
    const needed = Math.abs(delta);
    const updated = await Model.findOneAndUpdate(
      { _id: productId, quantity: { $gte: needed } },
      { $inc: { quantity: -needed } },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new Error('Insufficient stock or product not found');
    }
    return updated;
  }

  // delta > 0 : increase quantity
  const updated = await Model.findByIdAndUpdate(
    productId,
    { $inc: { quantity: delta } },
    { new: true, runValidators: true }
  );
  if (!updated) throw new Error('Product not found');
  return updated;
};

// Index suggestions for faster queries
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1, isActive: 1 });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
