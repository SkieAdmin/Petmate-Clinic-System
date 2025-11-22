const prisma = require('../utils/prisma');

class AuditLogService {
  /**
   * Create an audit log entry
   * @param {Object} data - Audit log data
   * @param {number|null} data.userId - User ID who performed the action
   * @param {string} data.action - Action performed (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.)
   * @param {string} data.module - Module affected (Client, Patient, Appointment, etc.)
   * @param {number|null} data.recordId - ID of the affected record
   * @param {string|null} data.recordName - Name/description of the affected record
   * @param {Object|null} data.changes - Before/after changes object
   * @param {string|null} data.ipAddress - IP address of the user
   * @param {string|null} data.userAgent - User agent string
   * @param {string} data.status - Status of the action (SUCCESS, FAILED, ERROR)
   * @param {string|null} data.errorMessage - Error message if action failed
   */
  async createLog(data) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: data.userId || null,
          action: data.action,
          module: data.module,
          recordId: data.recordId || null,
          recordName: data.recordName || null,
          changes: data.changes ? JSON.stringify(data.changes) : null,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          status: data.status || 'SUCCESS',
          errorMessage: data.errorMessage || null,
        },
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error - audit logging should not break the application
      return null;
    }
  }

  /**
   * Get all audit logs with optional filters
   */
  async getAllLogs({ userId, action, module, status, startDate, endDate, limit = 100, offset = 0 }) {
    const where = {};

    if (userId) where.userId = parseInt(userId);
    if (action) where.action = action;
    if (module) where.module = module;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total: Number(total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    };
  }

  /**
   * Get audit log by ID
   */
  async getLogById(id) {
    return await prisma.auditLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get audit logs for a specific record
   */
  async getLogsForRecord(module, recordId) {
    return await prisma.auditLog.findMany({
      where: {
        module,
        recordId: parseInt(recordId),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getLogsForUser(userId, limit = 50) {
    return await prisma.auditLog.findMany({
      where: {
        userId: parseInt(userId),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Get statistics for audit logs
   */
  async getStatistics(startDate, endDate) {
    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [totalLogs, byAction, byModule, byStatus, byUser] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['module'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalLogs: Number(totalLogs),
      byAction: byAction.map(item => ({ action: item.action, count: Number(item._count) })),
      byModule: byModule.map(item => ({ module: item.module, count: Number(item._count) })),
      byStatus: byStatus.map(item => ({ status: item.status, count: Number(item._count) })),
      byUser: byUser.map(item => ({ userId: item.userId, count: Number(item._count) })),
    };
  }

  /**
   * Delete old audit logs (data retention)
   */
  async deleteOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

module.exports = new AuditLogService();
