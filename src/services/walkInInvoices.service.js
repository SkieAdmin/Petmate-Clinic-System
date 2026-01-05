const prisma = require('../utils/prisma');

class WalkInInvoiceService {
  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const lastInvoice = await prisma.walkInInvoice.findFirst({
      where: { invoiceNumber: { startsWith: `WI-${year}` } },
      orderBy: { invoiceNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `WI-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllWalkInInvoices(filters = {}) {
    const { status, startDate, endDate, search } = filters;
    const where = {};

    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { petName: { contains: search } },
      ];
    }

    return await prisma.walkInInvoice.findMany({
      where,
      include: {
        preparedBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getWalkInInvoiceById(id) {
    return await prisma.walkInInvoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        preparedBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
      },
    });
  }

  async createWalkInInvoice(data, userId) {
    const invoiceNumber = await this.generateInvoiceNumber();
    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.priceEach, 0);

    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.walkInInvoice.create({
        data: {
          invoiceNumber,
          date: data.date ? new Date(data.date) : new Date(),
          customerName: data.customerName,
          customerPhone: data.customerPhone || null,
          customerAddress: data.customerAddress || null,
          petName: data.petName || null,
          petSpecies: data.petSpecies || null,
          totalAmount,
          status: data.status || 'Unpaid',
          paymentMethod: data.paymentMethod || null,
          cashAmount: data.cashAmount ? parseFloat(data.cashAmount) : 0,
          gcashAmount: data.gcashAmount ? parseFloat(data.gcashAmount) : 0,
          gcashReference: data.gcashReference || null,
          notes: data.notes || null,
          preparedById: userId,
          items: {
            create: data.items.map((item) => ({
              quantity: item.quantity,
              priceEach: item.priceEach,
              subtotal: item.quantity * item.priceEach,
              itemId: parseInt(item.itemId),
            })),
          },
        },
        include: {
          preparedBy: { select: { id: true, fullName: true } },
          items: { include: { item: true } },
        },
      });

      // Deduct inventory for product items
      for (const item of data.items) {
        const inventoryItem = await tx.item.findUnique({
          where: { id: parseInt(item.itemId) },
        });
        if (inventoryItem && inventoryItem.itemType === 'Product') {
          await tx.item.update({
            where: { id: parseInt(item.itemId) },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      return invoice;
    });
  }

  async updateWalkInInvoice(id, data) {
    return await prisma.walkInInvoice.update({
      where: { id: parseInt(id) },
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        petName: data.petName,
        petSpecies: data.petSpecies,
        notes: data.notes,
      },
      include: {
        preparedBy: { select: { id: true, fullName: true } },
        items: { include: { item: true } },
      },
    });
  }

  async payWalkInInvoice(id, paymentData) {
    return await prisma.walkInInvoice.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Paid',
        paymentMethod: paymentData.paymentMethod,
        cashAmount: paymentData.cashAmount ? parseFloat(paymentData.cashAmount) : 0,
        gcashAmount: paymentData.gcashAmount ? parseFloat(paymentData.gcashAmount) : 0,
        gcashReference: paymentData.gcashReference || null,
      },
    });
  }

  async deleteWalkInInvoice(id) {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.walkInInvoice.findUnique({
        where: { id: parseInt(id) },
        include: { items: { include: { item: true } } },
      });

      // Restore inventory for product items
      for (const invoiceItem of invoice.items) {
        if (invoiceItem.item.itemType === 'Product') {
          await tx.item.update({
            where: { id: invoiceItem.itemId },
            data: { quantity: { increment: invoiceItem.quantity } },
          });
        }
      }

      return await tx.walkInInvoice.delete({
        where: { id: parseInt(id) },
      });
    });
  }
}

module.exports = new WalkInInvoiceService();
