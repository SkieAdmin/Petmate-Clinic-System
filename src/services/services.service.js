const prisma = require('../utils/prisma');

class ServicesService {
  async getAllServices(filters = {}) {
    const { category, isActive, search } = filters;
    const where = {};

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return await prisma.service.findMany({
      where,
      include: {
        _count: { select: { serviceRecords: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceById(id) {
    return await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        serviceRecords: {
          include: {
            patient: { include: { client: true } },
            performedBy: { select: { id: true, fullName: true } },
          },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });
  }

  async createService(data) {
    return await prisma.service.create({
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        price: parseFloat(data.price),
        duration: data.duration ? parseInt(data.duration) : null,
        isActive: data.isActive !== false,
      },
    });
  }

  async updateService(id, data) {
    return await prisma.service.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price ? parseFloat(data.price) : undefined,
        duration: data.duration !== undefined ? (data.duration ? parseInt(data.duration) : null) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async deleteService(id) {
    return await prisma.service.delete({
      where: { id: parseInt(id) },
    });
  }

  async getActiveServices() {
    return await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceCategories() {
    return ['Vaccination', 'Surgery', 'Grooming', 'Checkup', 'Laboratory', 'Dental', 'Emergency', 'Consultation', 'Other'];
  }

  // Service Records
  async createServiceRecord(data, userId) {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(data.serviceId) },
    });

    const price = data.price || service.price;
    const discount = data.discount || 0;
    const total = (price * data.quantity) - discount;

    return await prisma.serviceRecord.create({
      data: {
        date: data.date ? new Date(data.date) : new Date(),
        quantity: data.quantity || 1,
        price,
        discount,
        total,
        notes: data.notes || null,
        serviceId: parseInt(data.serviceId),
        patientId: parseInt(data.patientId),
        performedById: userId,
        invoiceId: data.invoiceId ? parseInt(data.invoiceId) : null,
      },
      include: {
        service: true,
        patient: { include: { client: true } },
        performedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async getServiceRecordsByPatient(patientId) {
    return await prisma.serviceRecord.findMany({
      where: { patientId: parseInt(patientId) },
      include: {
        service: true,
        performedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getServiceSummary(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const records = await prisma.serviceRecord.groupBy({
      by: ['serviceId'],
      where,
      _sum: { total: true, quantity: true },
      _count: true,
    });

    // Get service names
    const services = await prisma.service.findMany({
      where: { id: { in: records.map((r) => r.serviceId) } },
    });

    return records.map((r) => ({
      ...r,
      service: services.find((s) => s.id === r.serviceId),
    }));
  }
}

module.exports = new ServicesService();
