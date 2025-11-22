const prisma = require('../utils/prisma');

class PrescriptionService {
  // Get all prescriptions
  async getAllPrescriptions(diagnosisId, patientId) {
    const where = {};
    if (diagnosisId) where.diagnosisId = parseInt(diagnosisId);
    if (patientId) where.patientId = parseInt(patientId);

    return await prisma.prescription.findMany({
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

  // Get prescription by ID
  async getPrescriptionById(id) {
    return await prisma.prescription.findUnique({
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

  // Create new prescription
  async createPrescription(data) {
    return await prisma.prescription.create({
      data: {
        doctorName: data.doctorName,
        medications: data.medications,
        instructions: data.instructions,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : new Date(),
        diagnosisId: parseInt(data.diagnosisId),
        patientId: parseInt(data.patientId),
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

  // Update prescription
  async updatePrescription(id, data) {
    return await prisma.prescription.update({
      where: { id: parseInt(id) },
      data: {
        doctorName: data.doctorName,
        medications: data.medications,
        instructions: data.instructions,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : undefined,
      },
    });
  }

  // Delete prescription
  async deletePrescription(id) {
    return await prisma.prescription.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new PrescriptionService();
