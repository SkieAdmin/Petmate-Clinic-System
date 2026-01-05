const walkInInvoiceService = require('../services/walkInInvoices.service');
const asyncHandler = require('../utils/asyncHandler');

class WalkInInvoiceController {
  getAllWalkInInvoices = asyncHandler(async (req, res) => {
    const { status, startDate, endDate, search } = req.query;
    const invoices = await walkInInvoiceService.getAllWalkInInvoices({ status, startDate, endDate, search });
    res.status(200).json({ success: true, count: invoices.length, data: invoices });
  });

  getWalkInInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await walkInInvoiceService.getWalkInInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Walk-in invoice not found' });
    }
    res.status(200).json({ success: true, data: invoice });
  });

  createWalkInInvoice = asyncHandler(async (req, res) => {
    const { customerName, items } = req.body;
    if (!customerName || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer name and items are required' });
    }
    const invoice = await walkInInvoiceService.createWalkInInvoice(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Walk-in invoice created successfully', data: invoice });
  });

  updateWalkInInvoice = asyncHandler(async (req, res) => {
    const invoice = await walkInInvoiceService.updateWalkInInvoice(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Walk-in invoice updated successfully', data: invoice });
  });

  payWalkInInvoice = asyncHandler(async (req, res) => {
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }
    const invoice = await walkInInvoiceService.payWalkInInvoice(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Payment recorded successfully', data: invoice });
  });

  deleteWalkInInvoice = asyncHandler(async (req, res) => {
    await walkInInvoiceService.deleteWalkInInvoice(req.params.id);
    res.status(200).json({ success: true, message: 'Walk-in invoice deleted successfully' });
  });
}

module.exports = new WalkInInvoiceController();
