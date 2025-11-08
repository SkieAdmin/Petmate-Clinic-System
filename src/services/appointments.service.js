const prisma = require('../utils/prisma');

class AppointmentService {
  // Get all appointments with optional date range filter
  async getAllAppointments(startDate = null, endDate = null) {
    const where = {};

    if (startDate && endDate) {
      where.dateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: { client: true },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  // Get appointments for a specific date range (calendar view)
  async getAppointmentsByDateRange(startDate, endDate) {
    return await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        patient: {
          include: { client: true },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  // Get today's appointments
  async getTodayAppointments() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          include: { client: true },
        },
      },
      orderBy: { dateTime: 'asc' },
    });
  }

  // Get appointment by ID
  async getAppointmentById(id) {
    return await prisma.appointment.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: { client: true },
        },
        invoice: true,
      },
    });
  }

  // Create new appointment
  async createAppointment(data) {
    return await prisma.appointment.create({
      data: {
        dateTime: new Date(data.dateTime),
        reason: data.reason || null,
        status: data.status || 'Scheduled',
        notes: data.notes || null,
        patientId: parseInt(data.patientId),
      },
      include: {
        patient: {
          include: { client: true },
        },
      },
    });
  }

  // Update appointment
  async updateAppointment(id, data) {
    return await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: {
        dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
        reason: data.reason || null,
        status: data.status,
        notes: data.notes || null,
        patientId: data.patientId ? parseInt(data.patientId) : undefined,
      },
      include: {
        patient: {
          include: { client: true },
        },
      },
    });
  }

  // Delete appointment
  async deleteAppointment(id) {
    return await prisma.appointment.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get appointment count (with optional status filter)
  async getAppointmentCount(status = null) {
    const where = status ? { status } : {};
    const count = await prisma.appointment.count({ where });
    return Number(count);
  }

  // Get upcoming appointments count
  async getUpcomingAppointmentsCount() {
    const count = await prisma.appointment.count({
      where: {
        dateTime: {
          gte: new Date(),
        },
        status: 'Scheduled',
      },
    });
    return Number(count);
  }
}

module.exports = new AppointmentService();
