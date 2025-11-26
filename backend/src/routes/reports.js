const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/auth');

// All routes protected
router.use(authMiddleware);

// GET /api/reports/inventory-valuation
router.get('/inventory-valuation', reportsController.getInventoryValuation);

// GET /api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31
router.get('/profit-loss', reportsController.getProfitLossAnalysis);

// GET /api/reports/expired-products
router.get('/expired-products', reportsController.getExpiredProducts);

module.exports = router;
