const prisma = require('../utils/prisma');

class TreatmentService {
  // Get all treatments
  async getAllTreatments(diagnosisId) {
    const where = diagnosisId ? { diagnosisId: parseInt(diagnosisId) } : {};

    return await prisma.treatment.findMany({
      where,
      include: {
        diagnosis: {
          include: {
            patient: {
              include: {
                client: true,
              },
            },
            doctor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get treatment by ID
  async getTreatmentById(id) {
    return await prisma.treatment.findUnique({
      where: { id: parseInt(id) },
      include: {
        diagnosis: {
          include: {
            patient: {
              include: {
                client: true,
              },
            },
            doctor: true,
          },
        },
      },
    });
  }

  // Create new treatment
  async createTreatment(data) {
    return await prisma.treatment.create({
      data: {
        treatmentType: data.treatmentType,
        medication: data.medication,
        dosage: data.dosage,
        duration: data.duration,
        cost: data.cost || 0,
        notes: data.notes,
        diagnosisId: parseInt(data.diagnosisId),
      },
      include: {
        diagnosis: {
          include: {
            patient: {
              include: {
                client: true,
              },
            },
            doctor: true,
          },
        },
      },
    });
  }

  // Update treatment
  async updateTreatment(id, data) {
    return await prisma.treatment.update({
      where: { id: parseInt(id) },
      data: {
        treatmentType: data.treatmentType,
        medication: data.medication,
        dosage: data.dosage,
        duration: data.duration,
        cost: data.cost,
        notes: data.notes,
      },
    });
  }

  // Delete treatment
  async deleteTreatment(id) {
    return await prisma.treatment.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new TreatmentService();
