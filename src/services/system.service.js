const prisma = require('../utils/prisma');

class SystemService {
  // Company Information
  async getCompanyInfo() {
    let company = await prisma.companyInfo.findFirst();
    if (!company) {
      company = await prisma.companyInfo.create({
        data: {
          name: 'Petmate Veterinary Clinic',
          address: '',
          phone: '',
          email: '',
        },
      });
    }
    return company;
  }

  async updateCompanyInfo(data) {
    const company = await this.getCompanyInfo();
    return await prisma.companyInfo.update({
      where: { id: company.id },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        tinNumber: data.tinNumber,
        logo: data.logo,
        tagline: data.tagline,
        operatingHours: data.operatingHours,
      },
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalClients,
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      activeAdmissions,
      todayConsultations,
      lowStockItems,
      monthlyRevenue,
      todayRevenue,
      upcomingFollowUps,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          dateTime: { gte: today, lt: tomorrow },
        },
      }),
      prisma.appointment.count({
        where: { status: 'Pending' },
      }),
      prisma.admission.count({
        where: { status: 'Ongoing' },
      }),
      prisma.consultation.count({
        where: {
          consultationDate: { gte: today, lt: tomorrow },
        },
      }),
      prisma.item.count({
        where: {
          quantity: { lte: prisma.item.fields.minQuantity },
        },
      }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: thisMonth, lt: nextMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: today, lt: tomorrow },
        },
        _sum: { totalAmount: true },
      }),
      prisma.consultation.count({
        where: {
          status: 'For Follow-up',
          nextCheckUpDate: { gte: today },
        },
      }),
    ]);

    return {
      totalClients: Number(totalClients),
      totalPatients: Number(totalPatients),
      totalAppointments: Number(totalAppointments),
      todayAppointments: Number(todayAppointments),
      pendingAppointments: Number(pendingAppointments),
      activeAdmissions: Number(activeAdmissions),
      todayConsultations: Number(todayConsultations),
      lowStockItems: Number(lowStockItems),
      monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      todayRevenue: todayRevenue._sum.totalAmount || 0,
      upcomingFollowUps: Number(upcomingFollowUps),
    };
  }

  // Recent Activity
  async getRecentActivity(limit = 10) {
    const [recentAppointments, recentConsultations, recentAdmissions, recentInvoices] = await Promise.all([
      prisma.appointment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { fullName: true } },
        },
      }),
      prisma.consultation.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { fullName: true } },
        },
      }),
      prisma.admission.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { client: true } },
          admittedBy: { select: { fullName: true } },
        },
      }),
      prisma.invoice.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: true,
          preparedBy: { select: { fullName: true } },
        },
      }),
    ]);

    return {
      recentAppointments,
      recentConsultations,
      recentAdmissions,
      recentInvoices,
    };
  }

  // Calendar data
  async getCalendarData(startDate, endDate) {
    const [appointments, consultations, followUps] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          dateTime: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { fullName: true } },
        },
      }),
      prisma.consultation.findMany({
        where: {
          consultationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { fullName: true } },
        },
      }),
      prisma.consultation.findMany({
        where: {
          nextCheckUpDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          status: 'For Follow-up',
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { fullName: true } },
        },
      }),
    ]);

    return {
      appointments,
      consultations,
      followUps,
    };
  }

  // Daily Schedule
  async getDailySchedule(date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const [appointments, consultations, followUps] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          dateTime: { gte: dayStart, lte: dayEnd },
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { id: true, fullName: true } },
        },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.consultation.findMany({
        where: {
          consultationDate: { gte: dayStart, lte: dayEnd },
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { id: true, fullName: true } },
        },
        orderBy: { consultationDate: 'asc' },
      }),
      prisma.consultation.findMany({
        where: {
          nextCheckUpDate: { gte: dayStart, lte: dayEnd },
          status: 'For Follow-up',
        },
        include: {
          patient: { include: { client: true } },
          doctor: { select: { id: true, fullName: true } },
        },
        orderBy: { nextCheckUpDate: 'asc' },
      }),
    ]);

    return {
      appointments,
      consultations,
      followUps,
    };
  }
}

module.exports = new SystemService();
