const systemService = require('../services/system.service');
const asyncHandler = require('../utils/asyncHandler');

class SystemController {
  getCompanyInfo = asyncHandler(async (req, res) => {
    const company = await systemService.getCompanyInfo();
    res.status(200).json({ success: true, data: company });
  });

  updateCompanyInfo = asyncHandler(async (req, res) => {
    const company = await systemService.updateCompanyInfo(req.body);
    res.status(200).json({ success: true, message: 'Company information updated', data: company });
  });

  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await systemService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  });

  getRecentActivity = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const activity = await systemService.getRecentActivity(limit ? parseInt(limit) : 10);
    res.status(200).json({ success: true, data: activity });
  });

  getCalendarData = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required' });
    }
    const data = await systemService.getCalendarData(startDate, endDate);
    res.status(200).json({ success: true, data });
  });

  getDailySchedule = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const scheduleDate = date || new Date().toISOString().split('T')[0];
    const schedule = await systemService.getDailySchedule(scheduleDate);
    res.status(200).json({ success: true, data: schedule });
  });
}

module.exports = new SystemController();
