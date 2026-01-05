const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

router.get('/company', systemController.getCompanyInfo);
router.put('/company', systemController.updateCompanyInfo);
router.get('/dashboard', systemController.getDashboardStats);
router.get('/recent-activity', systemController.getRecentActivity);
router.get('/calendar', systemController.getCalendarData);
router.get('/daily-schedule', systemController.getDailySchedule);

module.exports = router;
