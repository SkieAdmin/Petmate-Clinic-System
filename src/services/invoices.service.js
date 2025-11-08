const prisma = require('../utils/prisma');

class InvoiceService {
  // Generate unique invoice number
  async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}`,
        },
      },
    });
    const nextNumber = (Number(count) + 1).toString().padStart(4, '0');
    return `INV-${year}-${nextNumber}`;
  }

  // Get all invoices with optional filters
  async getAllInvoices(clientId = null, status = null) {
    const where = {};

    if (clientId) {
      where.clientId = parseInt(clientId);
    }

    if (status) {
      where.status = status;
    }

    return await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: {
          include: { item: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    return await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        items: {
          include: { item: true },
        },
        appointments: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  // Create new invoice
  async createInvoice(data) {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals for each item and grand total
    let totalAmount = 0;
    const invoiceItems = data.items.map((item) => {
      const subtotal = item.quantity * item.priceEach;
      totalAmount += subtotal;
      return {
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity),
        priceEach: parseFloat(item.priceEach),
        subtotal: subtotal,
      };
    });

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId: parseInt(data.clientId),
        date: data.date ? new Date(data.date) : new Date(),
        totalAmount,
        status: data.status || 'Unpaid',
        notes: data.notes || null,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        client: true,
        items: {
          include: { item: true },
        },
      },
    });

    // Update inventory quantities for products (not services)
    for (const item of data.items) {
      const inventoryItem = await prisma.item.findUnique({
        where: { id: parseInt(item.itemId) },
      });

      if (inventoryItem && inventoryItem.itemType === 'Product') {
        await prisma.item.update({
          where: { id: parseInt(item.itemId) },
          data: {
            quantity: inventoryItem.quantity - parseInt(item.quantity),
          },
        });
      }
    }

    return invoice;
  }

  // Update invoice
  async updateInvoice(id, data) {
    return await prisma.invoice.update({
      where: { id: parseInt(id) },
      data: {
        status: data.status,
        notes: data.notes || null,
      },
      include: {
        client: true,
        items: {
          include: { item: true },
        },
      },
    });
  }

  // Delete invoice
  async deleteInvoice(id) {
    return await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });
  }

  // Get total revenue (with optional date range)
  async getTotalRevenue(startDate = null, endDate = null) {
    const where = { status: 'Paid' };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const result = await prisma.invoice.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
    });

    return result._sum.totalAmount || 0;
  }

  // Get monthly revenue
  async getMonthlyRevenue() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    return await this.getTotalRevenue(startOfMonth, endOfMonth);
  }

  // Get invoice count
  async getInvoiceCount() {
    const count = await prisma.invoice.count();
    return Number(count);
  }
}

module.exports = new InvoiceService();
