const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');

/**
 * Get Inventory Valuation Report
 * Calculates total inventory value based on cost price and selling price
 */
exports.getInventoryValuation = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    let totalCostValue = 0;
    let totalSellingValue = 0;
    let totalItems = 0;

    const productDetails = products.map(p => {
      const costValue = (p.costPrice || 0) * (p.quantity || 0);
      const sellingValue = (p.price || 0) * (p.quantity || 0);
      
      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      totalItems += p.quantity || 0;

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku,
        quantity: p.quantity || 0,
        costPrice: p.costPrice || 0,
        sellingPrice: p.price || 0,
        costValue: costValue,
        sellingValue: sellingValue,
        potentialProfit: sellingValue - costValue
      };
    });

    return res.json({
      summary: {
        totalProducts: products.length,
        totalItems,
        totalCostValue: totalCostValue.toFixed(2),
        totalSellingValue: totalSellingValue.toFixed(2),
        potentialProfit: (totalSellingValue - totalCostValue).toFixed(2),
        profitMargin: totalSellingValue > 0 ? 
          (((totalSellingValue - totalCostValue) / totalSellingValue) * 100).toFixed(2) : 0
      },
      products: productDetails
    });
  } catch (err) {
    console.error('Inventory valuation error:', err);
    return res.status(500).json({ error: 'Failed to generate inventory valuation report' });
  }
};

/**
 * Get Profit/Loss Analysis
 * Calculates actual profit from sales (invoices)
 */
exports.getProfitLossAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const invoiceFilter = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter } 
      : {};

    const invoices = await Invoice.find(invoiceFilter).populate('items.product');

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalInvoices = invoices.length;
    let paidInvoices = 0;
    let unpaidInvoices = 0;

    const salesByProduct = {};

    invoices.forEach(invoice => {
      // Revenue calculation
      const invoiceRevenue = invoice.total || 0;
      totalRevenue += invoiceRevenue;

      if (invoice.paid) {
        paidInvoices++;
      } else {
        unpaidInvoices++;
      }

      // Cost calculation from items
      invoice.items.forEach(item => {
        const product = item.product;
        const quantity = item.quantity || 0;
        const sellingPrice = item.price || 0;
        const costPrice = product?.costPrice || 0;

        const itemRevenue = sellingPrice * quantity;
        const itemCost = costPrice * quantity;
        const itemProfit = itemRevenue - itemCost;

        totalCost += itemCost;
        totalProfit += itemProfit;

        // Track sales by product
        const productId = product?._id?.toString() || 'unknown';
        if (!salesByProduct[productId]) {
          salesByProduct[productId] = {
            name: product?.name || 'Unknown',
            sku: product?.sku || 'N/A',
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }
        salesByProduct[productId].quantitySold += quantity;
        salesByProduct[productId].revenue += itemRevenue;
        salesByProduct[productId].cost += itemCost;
        salesByProduct[productId].profit += itemProfit;
      });
    });

    // Convert salesByProduct object to array and sort by profit
    const topProducts = Object.values(salesByProduct)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    return res.json({
      period: {
        startDate: startDate || 'Beginning',
        endDate: endDate || 'Now'
      },
      summary: {
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        totalRevenue: totalRevenue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        profitMargin: totalRevenue > 0 ? 
          ((totalProfit / totalRevenue) * 100).toFixed(2) : 0
      },
      topProducts
    });
  } catch (err) {
    console.error('Profit/loss analysis error:', err);
    return res.status(500).json({ error: 'Failed to generate profit/loss analysis' });
  }
};

/**
 * Get Expired Products Report
 * Shows products that have expired or expiring soon
 */
exports.getExpiredProducts = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Find products with expiry dates
    const products = await Product.find({
      expiryDate: { $ne: null },
      isActive: true
    }).populate('supplier', 'name contactEmail phone');

    const expired = [];
    const expiringSoon = [];
    const valid = [];

    products.forEach(p => {
      const expiryDate = new Date(p.expiryDate);
      
      if (expiryDate < now) {
        expired.push({
          ...p.toObject(),
          daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
          status: 'expired'
        });
      } else if (expiryDate < thirtyDaysFromNow) {
        expiringSoon.push({
          ...p.toObject(),
          daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
          status: 'expiring-soon'
        });
      } else {
        valid.push({
          ...p.toObject(),
          daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
          status: 'valid'
        });
      }
    });

    return res.json({
      summary: {
        totalTracked: products.length,
        expired: expired.length,
        expiringSoon: expiringSoon.length,
        valid: valid.length
      },
      expired,
      expiringSoon,
      valid
    });
  } catch (err) {
    console.error('Expired products error:', err);
    return res.status(500).json({ error: 'Failed to fetch expired products' });
  }
};
