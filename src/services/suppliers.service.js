const prisma = require('../utils/prisma');

class SupplierService {
  async getAllSuppliers(search = '') {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { contactPerson: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {};

    return await prisma.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchaseOrders: true, receivingReports: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id) {
    return await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        purchaseOrders: {
          orderBy: { orderDate: 'desc' },
          take: 10,
        },
        receivingReports: {
          orderBy: { receiveDate: 'desc' },
          take: 10,
        },
        itemPrices: {
          include: { item: true },
        },
      },
    });
  }

  async createSupplier(data) {
    return await prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        isActive: data.isActive !== false,
      },
    });
  }

  async updateSupplier(id, data) {
    return await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        address: data.address,
        notes: data.notes,
        isActive: data.isActive,
      },
    });
  }

  async deleteSupplier(id) {
    return await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });
  }

  async getActiveSuppliers() {
    return await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateItemPrice(supplierId, itemId, price) {
    return await prisma.supplierItemPrice.upsert({
      where: {
        supplierId_itemId: {
          supplierId: parseInt(supplierId),
          itemId: parseInt(itemId),
        },
      },
      update: { price: parseFloat(price), lastUpdated: new Date() },
      create: {
        supplierId: parseInt(supplierId),
        itemId: parseInt(itemId),
        price: parseFloat(price),
      },
    });
  }

  async getItemPriceComparison(itemId) {
    return await prisma.supplierItemPrice.findMany({
      where: { itemId: parseInt(itemId) },
      include: { supplier: true },
      orderBy: { price: 'asc' },
    });
  }
}

module.exports = new SupplierService();
