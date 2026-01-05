const express = require('express');
const router = express.Router();
const receivingReportController = require('../controllers/receivingReports.controller');

router.get('/', receivingReportController.getAllReceivingReports);
router.get('/:id', receivingReportController.getReceivingReportById);
router.post('/', receivingReportController.createReceivingReport);
router.delete('/:id', receivingReportController.deleteReceivingReport);

module.exports = router;
