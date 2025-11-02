const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoices.controller');

// GET /api/invoices - Get all invoices (with optional clientId and status filters)
router.get('/', invoiceController.getAllInvoices);

// GET /api/invoices/:id - Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// GET /api/invoices/:id/pdf - Generate and download PDF invoice
router.get('/:id/pdf', invoiceController.generateInvoicePDF);

// POST /api/invoices - Create new invoice
router.post('/', invoiceController.createInvoice);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;
