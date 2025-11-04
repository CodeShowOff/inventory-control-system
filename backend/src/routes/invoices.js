const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const invoiceController = require('../controllers/invoiceController');

// Create invoice
router.post('/', auth, invoiceController.createInvoice);
// Get all invoices
router.get('/', auth, invoiceController.getInvoices);
// Get invoice by ID
router.get('/:id', auth, invoiceController.getInvoiceById);
// Mark invoice as paid
router.put('/:id/pay', auth, invoiceController.markInvoicePaid);
// Delete invoice
router.delete('/:id', auth, invoiceController.deleteInvoice);

module.exports = router;
