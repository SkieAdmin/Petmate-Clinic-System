const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrders.controller');

router.get('/', purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrderById);
router.post('/', purchaseOrderController.createPurchaseOrder);
router.put('/:id', purchaseOrderController.updatePurchaseOrder);
router.put('/:id/approve', purchaseOrderController.approvePurchaseOrder);
router.put('/:id/cancel', purchaseOrderController.cancelPurchaseOrder);
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

module.exports = router;
