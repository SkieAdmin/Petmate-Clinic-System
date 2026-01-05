const receivingReportService = require('../services/receivingReports.service');
const asyncHandler = require('../utils/asyncHandler');

class ReceivingReportController {
  getAllReceivingReports = asyncHandler(async (req, res) => {
    const { supplierId, purchaseOrderId, startDate, endDate } = req.query;
    const reports = await receivingReportService.getAllReceivingReports({ supplierId, purchaseOrderId, startDate, endDate });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  });

  getReceivingReportById = asyncHandler(async (req, res) => {
    const report = await receivingReportService.getReceivingReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Receiving report not found' });
    }
    res.status(200).json({ success: true, data: report });
  });

  createReceivingReport = asyncHandler(async (req, res) => {
    const { supplierId, items } = req.body;
    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Supplier ID and items are required' });
    }
    const report = await receivingReportService.createReceivingReport(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Receiving report created successfully', data: report });
  });

  deleteReceivingReport = asyncHandler(async (req, res) => {
    await receivingReportService.deleteReceivingReport(req.params.id);
    res.status(200).json({ success: true, message: 'Receiving report deleted successfully' });
  });
}

module.exports = new ReceivingReportController();
