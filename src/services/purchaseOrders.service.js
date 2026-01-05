const prisma = require('../utils/prisma');

class PurchaseOrderService {
  async generatePONumber() {
    const year = new Date().getFullYear();
    const lastPO = await prisma.purchaseOrder.findFirst({
      where: { poNumber: { startsWith: `PO-${year}` } },
      orderBy: { poNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastPO) {
      const lastNumber = parseInt(lastPO.poNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `PO-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllPurchaseOrders(filters = {}) {
    const { supplierId, status, startDate, endDate } = filters;
    const where = {};

    if (supplierId) where.supplierId = parseInt(supplierId);
    if (status) where.status = status;
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    return await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        createdBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
        _count: { select: { receivingReports: true } },
      },
      orderBy: { orderDate: 'desc' },
    });
  }

  async getPurchaseOrderById(id) {
    return await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        supplier: true,
        createdBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
        receivingReports: {
          include: { items: { include: { item: true } } },
        },
      },
    });
  }

  async createPurchaseOrder(data, userId) {
    const poNumber = await this.generatePONumber();
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return await prisma.purchaseOrder.create({
      data: {
        poNumber,
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
        status: 'Pending',
        totalAmount,
        notes: data.notes || null,
        supplierId: parseInt(data.supplierId),
        createdById: userId,
        items: {
          create: data.items.map((item) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            itemId: parseInt(item.itemId),
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { item: true } },
      },
    });
  }

  async updatePurchaseOrder(id, data) {
    const updateData = {};
    if (data.expectedDate !== undefined) updateData.expectedDate = data.expectedDate ? new Date(data.expectedDate) : null;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        supplier: true,
        items: { include: { item: true } },
      },
    });
  }

  async deletePurchaseOrder(id) {
    return await prisma.purchaseOrder.delete({
      where: { id: parseInt(id) },
    });
  }

  async approvePurchaseOrder(id) {
    return await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: { status: 'Approved' },
    });
  }

  async cancelPurchaseOrder(id) {
    return await prisma.purchaseOrder.update({
      where: { id: parseInt(id) },
      data: { status: 'Cancelled' },
    });
  }
}

module.exports = new PurchaseOrderService();
