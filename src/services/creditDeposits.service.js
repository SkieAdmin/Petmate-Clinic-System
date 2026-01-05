const prisma = require('../utils/prisma');

class CreditDepositService {
  async generateDepositNumber() {
    const year = new Date().getFullYear();
    const lastDeposit = await prisma.creditDeposit.findFirst({
      where: { depositNumber: { startsWith: `CD-${year}` } },
      orderBy: { depositNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastDeposit) {
      const lastNumber = parseInt(lastDeposit.depositNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `CD-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllCreditDeposits(filters = {}) {
    const { clientId, status, startDate, endDate, search } = filters;
    const where = {};

    if (clientId) where.clientId = parseInt(clientId);
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { depositNumber: { contains: search } },
        { reference: { contains: search } },
        { client: { name: { contains: search } } },
      ];
    }

    return await prisma.creditDeposit.findMany({
      where,
      include: {
        client: true,
        receivedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getCreditDepositById(id) {
    return await prisma.creditDeposit.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        receivedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async getCreditDepositsByClient(clientId) {
    return await prisma.creditDeposit.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        receivedBy: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getClientCreditBalance(clientId) {
    const deposits = await prisma.creditDeposit.aggregate({
      where: {
        clientId: parseInt(clientId),
        status: 'Pending',
      },
      _sum: { amount: true },
    });
    return deposits._sum.amount || 0;
  }

  async createCreditDeposit(data, userId) {
    const depositNumber = await this.generateDepositNumber();

    return await prisma.creditDeposit.create({
      data: {
        depositNumber,
        date: data.date ? new Date(data.date) : new Date(),
        amount: parseFloat(data.amount),
        reference: data.reference || null,
        notes: data.notes || null,
        status: 'Pending',
        clientId: parseInt(data.clientId),
        receivedById: userId,
      },
      include: {
        client: true,
        receivedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async applyCreditToInvoice(depositId, invoiceId) {
    return await prisma.creditDeposit.update({
      where: { id: parseInt(depositId) },
      data: {
        status: 'Applied',
        invoiceId: parseInt(invoiceId),
      },
    });
  }

  async refundCredit(id) {
    return await prisma.creditDeposit.update({
      where: { id: parseInt(id) },
      data: { status: 'Refunded' },
    });
  }

  async deleteCreditDeposit(id) {
    return await prisma.creditDeposit.delete({
      where: { id: parseInt(id) },
    });
  }

  async getCreditDepositStats(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [total, pending, applied, refunded] = await Promise.all([
      prisma.creditDeposit.aggregate({ where, _sum: { amount: true } }),
      prisma.creditDeposit.aggregate({ where: { ...where, status: 'Pending' }, _sum: { amount: true } }),
      prisma.creditDeposit.aggregate({ where: { ...where, status: 'Applied' }, _sum: { amount: true } }),
      prisma.creditDeposit.aggregate({ where: { ...where, status: 'Refunded' }, _sum: { amount: true } }),
    ]);

    return {
      total: total._sum.amount || 0,
      pending: pending._sum.amount || 0,
      applied: applied._sum.amount || 0,
      refunded: refunded._sum.amount || 0,
    };
  }
}

module.exports = new CreditDepositService();
