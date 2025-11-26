const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const supplierController = require('../controllers/supplierController');

// Create supplier
router.post('/', auth, supplierController.createSupplier);
// Get all suppliers
router.get('/', auth, supplierController.getSuppliers);
// Get supplier by ID
router.get('/:id', auth, supplierController.getSupplierById);
// Update supplier
router.put('/:id', auth, supplierController.updateSupplier);
// Delete supplier
router.delete('/:id', auth, supplierController.deleteSupplier);

module.exports = router;
