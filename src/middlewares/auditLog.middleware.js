const auditLogService = require('../services/auditLog.service');

/**
 * Middleware to automatically log API requests
 */
const auditLogger = (module) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;

    // Override res.json to capture response
    res.json = function(data) {
      // Restore original json function
      res.json = originalJson;

      // Determine action based on HTTP method
      let action = 'UNKNOWN';
      if (req.method === 'POST') action = 'CREATE';
      else if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
      else if (req.method === 'DELETE') action = 'DELETE';
      else if (req.method === 'GET') action = 'VIEW';

      // Get record ID from params or body
      const recordId = req.params.id || data.data?.id || null;
      const recordName = data.data?.name || data.data?.email || data.data?.invoiceNumber || null;

      // Get user info from request
      const userId = req.user?.userId || null;
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      // Log the action
      auditLogService.createLog({
        userId,
        action,
        module,
        recordId,
        recordName,
        changes: null, // Can be enhanced to include before/after changes
        ipAddress,
        userAgent,
        status: data.success ? 'SUCCESS' : 'FAILED',
        errorMessage: data.success ? null : data.message,
      });

      // Call original json function
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to manually log specific actions
 */
const logAction = async ({
  req,
  action,
  module,
  recordId,
  recordName,
  changes,
  status = 'SUCCESS',
  errorMessage = null,
}) => {
  const userId = req.user?.userId || null;
  const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  const userAgent = req.headers['user-agent'];

  return await auditLogService.createLog({
    userId,
    action,
    module,
    recordId,
    recordName,
    changes,
    ipAddress,
    userAgent,
    status,
    errorMessage,
  });
};

module.exports = {
  auditLogger,
  logAction,
};
