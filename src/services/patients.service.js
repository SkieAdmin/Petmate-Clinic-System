const prisma = require('../utils/prisma');

class PatientService {
  // Get all patients with optional search
  async getAllPatients(searchTerm = '') {
    const where = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { species: { contains: searchTerm, mode: 'insensitive' } },
            { breed: { contains: searchTerm, mode: 'insensitive' } },
            { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        }
      : {};

    return await prisma.patient.findMany({
      where,
      include: {
        client: true,
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get patients by client ID
  async getPatientsByClientId(clientId) {
    return await prisma.patient.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        appointments: {
          orderBy: { dateTime: 'desc' },
          take: 5,
        },
      },
    });
  }

  // Get patient by ID
  async getPatientById(id) {
    return await prisma.patient.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        appointments: {
          orderBy: { dateTime: 'desc' },
        },
      },
    });
  }

  // Create new patient
  async createPatient(data) {
    return await prisma.patient.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        color: data.color || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        treatment: data.treatment || null,
        prescription: data.prescription || null,
        clientId: parseInt(data.clientId),
      },
      include: { client: true },
    });
  }

  // Update patient
  async updatePatient(id, data) {
    return await prisma.patient.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        color: data.color || null,
        phone: data.phone || null,
        address: data.address || null,
        notes: data.notes || null,
        treatment: data.treatment || null,
        prescription: data.prescription || null,
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
      },
      include: { client: true },
    });
  }

  // Delete patient
  async deletePatient(id) {
    return await prisma.patient.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get patient count
  async getPatientCount() {
    const count = await prisma.patient.count();
    return Number(count);
  }
}

module.exports = new PatientService();
