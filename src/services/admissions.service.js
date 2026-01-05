const prisma = require('../utils/prisma');

class AdmissionService {
  async getAllAdmissions(filters = {}) {
    const { patientId, status, admissionType, startDate, endDate, search } = filters;
    const where = {};

    if (patientId) where.patientId = parseInt(patientId);
    if (status) where.status = status;
    if (admissionType) where.admissionType = admissionType;
    if (startDate || endDate) {
      where.admissionDate = {};
      if (startDate) where.admissionDate.gte = new Date(startDate);
      if (endDate) where.admissionDate.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { patient: { name: { contains: search } } },
        { patient: { client: { name: { contains: search } } } },
      ];
    }

    return await prisma.admission.findMany({
      where,
      include: {
        patient: {
          include: { client: true },
        },
        admittedBy: { select: { id: true, fullName: true } },
        confinements: {
          orderBy: { checkDate: 'desc' },
          take: 5,
        },
        consultations: {
          orderBy: { consultationDate: 'desc' },
          take: 5,
          include: {
            doctor: { select: { id: true, fullName: true } },
          },
        },
        _count: { select: { consultations: true, confinements: true } },
      },
      orderBy: { admissionDate: 'desc' },
    });
  }

  async getAdmissionById(id) {
    return await prisma.admission.findUnique({
      where: { id: parseInt(id) },
      include: {
        patient: {
          include: {
            client: true,
            diagnoses: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        admittedBy: { select: { id: true, fullName: true } },
        confinements: {
          orderBy: { checkDate: 'desc' },
        },
        consultations: {
          orderBy: { consultationDate: 'desc' },
          include: {
            doctor: { select: { id: true, fullName: true } },
          },
        },
      },
    });
  }

  async createAdmission(data, userId) {
    return await prisma.admission.create({
      data: {
        admissionType: data.admissionType,
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
        reason: data.reason,
        status: data.status || 'Ongoing',
        notes: data.notes || null,
        patientId: parseInt(data.patientId),
        admittedById: userId,
      },
      include: {
        patient: { include: { client: true } },
        admittedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async updateAdmission(id, data) {
    const updateData = {};

    if (data.admissionType !== undefined) updateData.admissionType = data.admissionType;
    if (data.admissionDate !== undefined) updateData.admissionDate = new Date(data.admissionDate);
    if (data.dischargeDate !== undefined) updateData.dischargeDate = data.dischargeDate ? new Date(data.dischargeDate) : null;
    if (data.reason !== undefined) updateData.reason = data.reason;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.admission.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        patient: { include: { client: true } },
        admittedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async dischargePatient(id, dischargeDate) {
    return await prisma.admission.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Completed',
        dischargeDate: dischargeDate ? new Date(dischargeDate) : new Date(),
      },
    });
  }

  async deleteAdmission(id) {
    return await prisma.admission.delete({
      where: { id: parseInt(id) },
    });
  }

  // Confinement management
  async addConfinementRecord(admissionId, data) {
    return await prisma.confinement.create({
      data: {
        status: data.status || 'Ongoing',
        notes: data.notes || null,
        checkDate: data.checkDate ? new Date(data.checkDate) : new Date(),
        admissionId: parseInt(admissionId),
      },
    });
  }

  async updateConfinementRecord(id, data) {
    return await prisma.confinement.update({
      where: { id: parseInt(id) },
      data: {
        status: data.status,
        notes: data.notes,
        checkDate: data.checkDate ? new Date(data.checkDate) : undefined,
      },
    });
  }

  async deleteConfinementRecord(id) {
    return await prisma.confinement.delete({
      where: { id: parseInt(id) },
    });
  }

  // Statistics
  async getAdmissionStats() {
    const [total, ongoing, completed, forFollowUp] = await Promise.all([
      prisma.admission.count(),
      prisma.admission.count({ where: { status: 'Ongoing' } }),
      prisma.admission.count({ where: { status: 'Completed' } }),
      prisma.admission.count({ where: { status: 'For Follow-up' } }),
    ]);

    return {
      total: Number(total),
      ongoing: Number(ongoing),
      completed: Number(completed),
      forFollowUp: Number(forFollowUp),
    };
  }

  async getActiveAdmissions() {
    return await prisma.admission.findMany({
      where: { status: 'Ongoing' },
      include: {
        patient: { include: { client: true } },
        admittedBy: { select: { id: true, fullName: true } },
        confinements: {
          orderBy: { checkDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { admissionDate: 'desc' },
    });
  }
}

module.exports = new AdmissionService();
