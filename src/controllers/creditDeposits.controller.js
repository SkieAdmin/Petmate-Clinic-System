const creditDepositService = require('../services/creditDeposits.service');
const asyncHandler = require('../utils/asyncHandler');

class CreditDepositController {
  getAllCreditDeposits = asyncHandler(async (req, res) => {
    const { clientId, status, startDate, endDate, search } = req.query;
    const deposits = await creditDepositService.getAllCreditDeposits({ clientId, status, startDate, endDate, search });
    res.status(200).json({ success: true, count: deposits.length, data: deposits });
  });

  getCreditDepositById = asyncHandler(async (req, res) => {
    const deposit = await creditDepositService.getCreditDepositById(req.params.id);
    if (!deposit) {
      return res.status(404).json({ success: false, message: 'Credit deposit not found' });
    }
    res.status(200).json({ success: true, data: deposit });
  });

  getCreditDepositsByClient = asyncHandler(async (req, res) => {
    const deposits = await creditDepositService.getCreditDepositsByClient(req.params.clientId);
    res.status(200).json({ success: true, count: deposits.length, data: deposits });
  });

  getClientCreditBalance = asyncHandler(async (req, res) => {
    const balance = await creditDepositService.getClientCreditBalance(req.params.clientId);
    res.status(200).json({ success: true, data: { balance } });
  });

  createCreditDeposit = asyncHandler(async (req, res) => {
    const { clientId, amount } = req.body;
    if (!clientId || !amount) {
      return res.status(400).json({ success: false, message: 'Client ID and amount are required' });
    }
    const deposit = await creditDepositService.createCreditDeposit(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Credit deposit created successfully', data: deposit });
  });

  applyCreditToInvoice = asyncHandler(async (req, res) => {
    const { invoiceId } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'Invoice ID is required' });
    }
    const deposit = await creditDepositService.applyCreditToInvoice(req.params.id, invoiceId);
    res.status(200).json({ success: true, message: 'Credit applied to invoice', data: deposit });
  });

  refundCredit = asyncHandler(async (req, res) => {
    const deposit = await creditDepositService.refundCredit(req.params.id);
    res.status(200).json({ success: true, message: 'Credit refunded', data: deposit });
  });

  deleteCreditDeposit = asyncHandler(async (req, res) => {
    await creditDepositService.deleteCreditDeposit(req.params.id);
    res.status(200).json({ success: true, message: 'Credit deposit deleted successfully' });
  });

  getStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await creditDepositService.getCreditDepositStats(startDate, endDate);
    res.status(200).json({ success: true, data: stats });
  });
}

module.exports = new CreditDepositController();
