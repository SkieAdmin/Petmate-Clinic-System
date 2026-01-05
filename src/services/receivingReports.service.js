const prisma = require('../utils/prisma');

class ReceivingReportService {
  async generateRRNumber() {
    const year = new Date().getFullYear();
    const lastRR = await prisma.receivingReport.findFirst({
      where: { rrNumber: { startsWith: `RR-${year}` } },
      orderBy: { rrNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastRR) {
      const lastNumber = parseInt(lastRR.rrNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `RR-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllReceivingReports(filters = {}) {
    const { supplierId, purchaseOrderId, startDate, endDate } = filters;
    const where = {};

    if (supplierId) where.supplierId = parseInt(supplierId);
    if (purchaseOrderId) where.purchaseOrderId = parseInt(purchaseOrderId);
    if (startDate || endDate) {
      where.receiveDate = {};
      if (startDate) where.receiveDate.gte = new Date(startDate);
      if (endDate) where.receiveDate.lte = new Date(endDate);
    }

    return await prisma.receivingReport.findMany({
      where,
      include: {
        supplier: true,
        purchaseOrder: true,
        receivedBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
      },
      orderBy: { receiveDate: 'desc' },
    });
  }

  async getReceivingReportById(id) {
    return await prisma.receivingReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        supplier: true,
        purchaseOrder: { include: { items: { include: { item: true } } } },
        receivedBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
      },
    });
  }

  async createReceivingReport(data, userId) {
    const rrNumber = await this.generateRRNumber();

    // Create receiving report and update inventory in a transaction
    return await prisma.$transaction(async (tx) => {
      const receivingReport = await tx.receivingReport.create({
        data: {
          rrNumber,
          receiveDate: data.receiveDate ? new Date(data.receiveDate) : new Date(),
          notes: data.notes || null,
          purchaseOrderId: data.purchaseOrderId ? parseInt(data.purchaseOrderId) : null,
          supplierId: parseInt(data.supplierId),
          receivedById: userId,
          items: {
            create: data.items.map((item) => ({
              quantityReceived: item.quantityReceived,
              quantityRejected: item.quantityRejected || 0,
              unitPrice: item.unitPrice,
              subtotal: item.quantityReceived * item.unitPrice,
              notes: item.notes || null,
              itemId: parseInt(item.itemId),
            })),
          },
        },
        include: {
          supplier: true,
          items: { include: { item: true } },
        },
      });

      // Update inventory quantities
      for (const item of data.items) {
        await tx.item.update({
          where: { id: parseInt(item.itemId) },
          data: {
            quantity: { increment: item.quantityReceived },
          },
        });
      }

      // Update purchase order status if applicable
      if (data.purchaseOrderId) {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: parseInt(data.purchaseOrderId) },
          include: { items: true },
        });

        // Check if all items are received
        const allReceived = po.items.every((poItem) => {
          const received = data.items.find((i) => parseInt(i.itemId) === poItem.itemId);
          return received && received.quantityReceived >= poItem.quantity;
        });

        await tx.purchaseOrder.update({
          where: { id: parseInt(data.purchaseOrderId) },
          data: { status: allReceived ? 'Received' : 'Partially Received' },
        });

        // Update received quantities in PO items
        for (const item of data.items) {
          await tx.purchaseOrderItem.updateMany({
            where: {
              purchaseOrderId: parseInt(data.purchaseOrderId),
              itemId: parseInt(item.itemId),
            },
            data: { receivedQty: { increment: item.quantityReceived } },
          });
        }
      }

      return receivingReport;
    });
  }

  async deleteReceivingReport(id) {
    // Reverse inventory changes in a transaction
    return await prisma.$transaction(async (tx) => {
      const rr = await tx.receivingReport.findUnique({
        where: { id: parseInt(id) },
        include: { items: true },
      });

      // Reverse inventory quantities
      for (const item of rr.items) {
        await tx.item.update({
          where: { id: item.itemId },
          data: { quantity: { decrement: item.quantityReceived } },
        });
      }

      return await tx.receivingReport.delete({
        where: { id: parseInt(id) },
      });
    });
  }
}

module.exports = new ReceivingReportService();
