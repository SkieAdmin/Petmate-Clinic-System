const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { requireRole } = require('../middlewares/auth.middleware');

// All audit log routes are admin-only
router.use(requireRole('Admin'));

// Get all audit logs with filtering
router.get('/', auditLogController.getAllLogs);

// Get audit log statistics
router.get('/statistics', auditLogController.getStatistics);

// Get audit logs for a specific record
router.get('/record/:module/:recordId', auditLogController.getLogsForRecord);

// Get audit logs for a specific user
router.get('/user/:userId', auditLogController.getLogsForUser);

// Get specific audit log by ID
router.get('/:id', auditLogController.getLogById);

// Delete old audit logs (cleanup)
router.delete('/cleanup', auditLogController.deleteOldLogs);

module.exports = router;
