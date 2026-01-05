const prisma = require('../utils/prisma');

class ExpenseService {
  async generateExpenseNumber() {
    const year = new Date().getFullYear();
    const lastExpense = await prisma.expense.findFirst({
      where: { expenseNumber: { startsWith: `EXP-${year}` } },
      orderBy: { expenseNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastExpense) {
      const lastNumber = parseInt(lastExpense.expenseNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `EXP-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  async getAllExpenses(filters = {}) {
    const { category, startDate, endDate, search } = filters;
    const where = {};

    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { reference: { contains: search } },
        { expenseNumber: { contains: search } },
      ];
    }

    return await prisma.expense.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getExpenseById(id) {
    return await prisma.expense.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async createExpense(data, userId) {
    const expenseNumber = await this.generateExpenseNumber();

    return await prisma.expense.create({
      data: {
        expenseNumber,
        date: data.date ? new Date(data.date) : new Date(),
        category: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod || null,
        reference: data.reference || null,
        notes: data.notes || null,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async updateExpense(id, data) {
    return await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        category: data.category,
        description: data.description,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        notes: data.notes,
      },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async deleteExpense(id) {
    return await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
  }

  async getExpenseStats(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const total = await prisma.expense.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      byCategory: expenses,
      total: total._sum.amount || 0,
    };
  }

  async getExpenseCategories() {
    return ['Utilities', 'Supplies', 'Rent', 'Salaries', 'Equipment', 'Maintenance', 'Marketing', 'Transportation', 'Other'];
  }
}

module.exports = new ExpenseService();
