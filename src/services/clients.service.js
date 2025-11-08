const prisma = require('../utils/prisma');

class ClientService {
  // Get all clients with optional search
  async getAllClients(searchTerm = '') {
    const where = searchTerm
      ? {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } },
          ],
        }
      : {};

    return await prisma.client.findMany({
      where,
      include: {
        patients: true,
        _count: {
          select: {
            patients: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get client by ID
  async getClientById(id) {
    return await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        invoices: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });
  }

  // Create new client
  async createClient(data) {
    return await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });
  }

  // Update client
  async updateClient(id, data) {
    return await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      },
    });
  }

  // Delete client
  async deleteClient(id) {
    return await prisma.client.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get client count
  async getClientCount() {
    const count = await prisma.client.count();
    return Number(count);
  }
}

module.exports = new ClientService();
