const reportService = require('../services/reports.service');
const asyncHandler = require('../utils/asyncHandler');

class ReportController {
  // Get dashboard summary
  getDashboardSummary = asyncHandler(async (req, res) => {
    const summary = await reportService.getDashboardSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  });

  // Get revenue report
  getRevenueReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const report = await reportService.getRevenueReport(startDate, endDate);

    res.status(200).json({
      success: true,
      data: report,
    });
  });

  // Get appointment statistics
  getAppointmentStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await reportService.getAppointmentStats(startDate, endDate);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Get top clients by revenue
  getTopClients = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const clients = await reportService.getTopClients(limit ? parseInt(limit) : 10);

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  });
}

module.exports = new ReportController();
