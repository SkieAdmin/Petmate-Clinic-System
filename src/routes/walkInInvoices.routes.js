const express = require('express');
const router = express.Router();
const walkInInvoiceController = require('../controllers/walkInInvoices.controller');

router.get('/', walkInInvoiceController.getAllWalkInInvoices);
router.get('/:id', walkInInvoiceController.getWalkInInvoiceById);
router.post('/', walkInInvoiceController.createWalkInInvoice);
router.put('/:id', walkInInvoiceController.updateWalkInInvoice);
router.put('/:id/pay', walkInInvoiceController.payWalkInInvoice);
router.delete('/:id', walkInInvoiceController.deleteWalkInInvoice);

module.exports = router;
