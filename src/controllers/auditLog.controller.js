const auditLogService = require('../services/auditLog.service');

/**
 * Get all audit logs with optional filtering
 */
const getAllLogs = async (req, res) => {
  try {
    const {
      userId,
      action,
      module,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = req.query;

    const logs = await auditLogService.getAllLogs({
      userId: userId ? parseInt(userId) : undefined,
      action,
      module,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

/**
 * Get audit log by ID
 */
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await auditLogService.getLogById(parseInt(id));

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found',
      });
    }

    return res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message,
    });
  }
};

/**
 * Get audit logs for a specific record
 */
const getLogsForRecord = async (req, res) => {
  try {
    const { module, recordId } = req.params;
    const logs = await auditLogService.getLogsForRecord(module, parseInt(recordId));

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching record audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch record audit logs',
      error: error.message,
    });
  }
};

/**
 * Get audit logs for a specific user
 */
const getLogsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await auditLogService.getLogsForUser(parseInt(userId), parseInt(limit));

    return res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user audit logs',
      error: error.message,
    });
  }
};

/**
 * Get audit log statistics
 */
const getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const statistics = await auditLogService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return res.json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Error fetching audit log statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log statistics',
      error: error.message,
    });
  }
};

/**
 * Delete old audit logs
 */
const deleteOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const count = await auditLogService.deleteOldLogs(parseInt(daysToKeep));

    return res.json({
      success: true,
      message: `Successfully deleted ${count} old audit logs`,
      data: { deletedCount: count },
    });
  } catch (error) {
    console.error('Error deleting old audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete old audit logs',
      error: error.message,
    });
  }
};

module.exports = {
  getAllLogs,
  getLogById,
  getLogsForRecord,
  getLogsForUser,
  getStatistics,
  deleteOldLogs,
};
