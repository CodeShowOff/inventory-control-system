const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.post('/', auth, purchaseOrderController.createOrder);
router.get('/', auth, purchaseOrderController.getOrders);
router.put('/:id/receive', auth, purchaseOrderController.receiveOrder);
router.delete('/:id', auth, purchaseOrderController.deleteOrder);

module.exports = router;
