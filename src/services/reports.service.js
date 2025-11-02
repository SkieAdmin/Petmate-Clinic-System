const prisma = require('../utils/prisma');
const invoiceService = require('./invoices.service');
const appointmentService = require('./appointments.service');
const clientService = require('./clients.service');
const patientService = require('./patients.service');
const itemService = require('./items.service');

class ReportService {
  // Get dashboard summary
  async getDashboardSummary() {
    const [
      clientCount,
      patientCount,
      upcomingAppointments,
      todayAppointments,
      monthlyRevenue,
      totalRevenue,
      lowStockCount,
      invoiceCount,
    ] = await Promise.all([
      clientService.getClientCount(),
      patientService.getPatientCount(),
      appointmentService.getUpcomingAppointmentsCount(),
      appointmentService.getTodayAppointments(),
      invoiceService.getMonthlyRevenue(),
      invoiceService.getTotalRevenue(),
      itemService.getLowStockCount(),
      invoiceService.getInvoiceCount(),
    ]);

    return {
      clients: {
        total: clientCount,
      },
      patients: {
        total: patientCount,
      },
      appointments: {
        upcoming: upcomingAppointments,
        today: todayAppointments.length,
        todayList: todayAppointments,
      },
      revenue: {
        monthly: monthlyRevenue,
        total: totalRevenue,
      },
      inventory: {
        lowStock: lowStockCount,
      },
      invoices: {
        total: invoiceCount,
      },
    };
  }

  // Get revenue report for a date range
  async getRevenueReport(startDate, endDate) {
    const invoices = await prisma.invoice.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: 'Paid',
      },
      include: {
        client: true,
        items: {
          include: { item: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      startDate,
      endDate,
      totalRevenue,
      invoiceCount: invoices.length,
      invoices,
    };
  }

  // Get appointment statistics
  async getAppointmentStats(startDate = null, endDate = null) {
    const where = {};

    if (startDate && endDate) {
      where.dateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [total, scheduled, completed, canceled] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: 'Scheduled' } }),
      prisma.appointment.count({ where: { ...where, status: 'Completed' } }),
      prisma.appointment.count({ where: { ...where, status: 'Canceled' } }),
    ]);

    return {
      total,
      scheduled,
      completed,
      canceled,
    };
  }

  // Get top clients by revenue
  async getTopClients(limit = 10) {
    const clients = await prisma.client.findMany({
      include: {
        invoices: {
          where: { status: 'Paid' },
        },
        patients: true,
      },
    });

    const clientsWithRevenue = clients.map((client) => ({
      ...client,
      totalRevenue: client.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      invoiceCount: client.invoices.length,
      patientCount: client.patients.length,
    }));

    return clientsWithRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}

module.exports = new ReportService();
