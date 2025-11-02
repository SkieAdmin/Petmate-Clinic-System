const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports.controller');

// GET /api/reports/summary - Get dashboard summary
router.get('/summary', reportController.getDashboardSummary);

// GET /api/reports/revenue - Get revenue report
router.get('/revenue', reportController.getRevenueReport);

// GET /api/reports/appointments - Get appointment statistics
router.get('/appointments', reportController.getAppointmentStats);

// GET /api/reports/top-clients - Get top clients by revenue
router.get('/top-clients', reportController.getTopClients);

module.exports = router;
