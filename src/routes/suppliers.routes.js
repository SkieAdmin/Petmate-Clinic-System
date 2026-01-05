const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers.controller');

router.get('/', supplierController.getAllSuppliers);
router.get('/active', supplierController.getActiveSuppliers);
router.get('/item-price/:itemId', supplierController.getItemPriceComparison);
router.get('/:id', supplierController.getSupplierById);
router.post('/', supplierController.createSupplier);
router.put('/:id', supplierController.updateSupplier);
router.put('/:id/item-price', supplierController.updateItemPrice);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
