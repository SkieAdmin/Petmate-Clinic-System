const prisma = require('../utils/prisma');

class ConsultationService {
  // Get all consultations with optional filters
  async getAllConsultations(filters = {}) {
    const { patientId, doctorId, status, startDate, endDate, search } = filters;

    const where = {};

    if (patientId) where.patientId = parseInt(patientId);
    if (doctorId) where.doctorId = parseInt(doctorId);
    if (status) where.status = status;

    if (startDate || endDate) {
      where.consultationDate = {};
      if (startDate) where.consultationDate.gte = new Date(startDate);
      if (endDate) where.consultationDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { diagnosis: { contains: search } },
        { treatment: { contains: search } },
        { prescription: { contains: search } },
        { notes: { contains: search } },
        { patient: { name: { contains: search } } },
        { patient: { client: { name: { contains: search } } } },
      ];
    }

    return await prisma.consultation.findMany({
      where,
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        admission: true,
      },
      orderBy: { consultationDate: 'desc' },
    });
  }

  // Get consultations by patient ID with full history
  async getConsultationsByPatientId(patientId) {
    return await prisma.consultation.findMany({
      where: { patientId: parseInt(patientId) },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        admission: true,
      },
      orderBy: { consultationDate: 'desc' },
    });
  }

  // Get consultations by doctor ID
  async getConsultationsByDoctorId(doctorId) {
    return await prisma.consultation.findMany({
      where: { doctorId: parseInt(doctorId) },
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        admission: true,
      },
      orderBy: { consultationDate: 'desc' },
    });
  }

  // Get consultation by ID
  async getConsultationById(id) {
    return await prisma.consultation.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            client: true,
            consultations: {
              orderBy: { consultationDate: 'desc' },
              take: 10,
            },
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        admission: true,
      },
    });
  }

  // Create new consultation
  async createConsultation(data) {
    return await prisma.consultation.create({
      data: {
        consultationDate: data.consultationDate ? new Date(data.consultationDate) : new Date(),
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        prescription: data.prescription || null,
        notes: data.notes || null,
        nextCheckUpDate: data.nextCheckUpDate ? new Date(data.nextCheckUpDate) : null,
        status: data.status || 'Ongoing',
        weight: data.weight ? parseFloat(data.weight) : null,
        temperature: data.temperature ? parseFloat(data.temperature) : null,
        vitalSigns: data.vitalSigns || null,
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        admissionId: data.admissionId ? parseInt(data.admissionId) : null,
      },
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Update consultation
  async updateConsultation(id, data) {
    const updateData = {};

    if (data.consultationDate !== undefined) {
      updateData.consultationDate = new Date(data.consultationDate);
    }
    if (data.diagnosis !== undefined) updateData.diagnosis = data.diagnosis;
    if (data.treatment !== undefined) updateData.treatment = data.treatment;
    if (data.prescription !== undefined) updateData.prescription = data.prescription;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.nextCheckUpDate !== undefined) {
      updateData.nextCheckUpDate = data.nextCheckUpDate ? new Date(data.nextCheckUpDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.weight !== undefined) updateData.weight = data.weight ? parseFloat(data.weight) : null;
    if (data.temperature !== undefined) updateData.temperature = data.temperature ? parseFloat(data.temperature) : null;
    if (data.vitalSigns !== undefined) updateData.vitalSigns = data.vitalSigns;
    if (data.admissionId !== undefined) {
      updateData.admissionId = data.admissionId ? parseInt(data.admissionId) : null;
    }

    return await prisma.consultation.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Mark consultation as completed
  async completeConsultation(id) {
    return await prisma.consultation.update({
      where: { id: parseInt(id) },
      data: { status: 'Completed' },
    });
  }

  // Mark consultation for follow-up
  async markForFollowUp(id, nextCheckUpDate) {
    return await prisma.consultation.update({
      where: { id: parseInt(id) },
      data: {
        status: 'For Follow-up',
        nextCheckUpDate: new Date(nextCheckUpDate),
      },
    });
  }

  // Delete consultation
  async deleteConsultation(id) {
    return await prisma.consultation.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get upcoming follow-ups
  async getUpcomingFollowUps(doctorId = null) {
    const where = {
      nextCheckUpDate: {
        gte: new Date(),
      },
      status: 'For Follow-up',
    };

    if (doctorId) where.doctorId = parseInt(doctorId);

    return await prisma.consultation.findMany({
      where,
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { nextCheckUpDate: 'asc' },
    });
  }

  // Get today's consultations
  async getTodayConsultations(doctorId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      consultationDate: {
        gte: today,
        lt: tomorrow,
      },
    };

    if (doctorId) where.doctorId = parseInt(doctorId);

    return await prisma.consultation.findMany({
      where,
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { consultationDate: 'asc' },
    });
  }

  // Get consultation statistics
  async getConsultationStats(doctorId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = doctorId ? { doctorId: parseInt(doctorId) } : {};
    const todayWhere = {
      ...where,
      consultationDate: {
        gte: today,
        lt: tomorrow,
      },
    };

    const [total, ongoing, completed, forFollowUp, todayCount] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.count({ where: { ...where, status: 'Ongoing' } }),
      prisma.consultation.count({ where: { ...where, status: 'Completed' } }),
      prisma.consultation.count({ where: { ...where, status: 'For Follow-up' } }),
      prisma.consultation.count({ where: todayWhere }),
    ]);

    return {
      total: Number(total),
      ongoing: Number(ongoing),
      completed: Number(completed),
      forFollowUp: Number(forFollowUp),
      today: Number(todayCount),
    };
  }

  // Get consultations for calendar view
  async getConsultationsForCalendar(startDate, endDate, doctorId = null) {
    const where = {
      OR: [
        {
          consultationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          nextCheckUpDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      ],
    };

    if (doctorId) where.doctorId = parseInt(doctorId);

    return await prisma.consultation.findMany({
      where,
      include: {
        patient: {
          include: {
            client: true,
          },
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { consultationDate: 'asc' },
    });
  }
}

module.exports = new ConsultationService();
