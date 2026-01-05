const expenseService = require('../services/expenses.service');
const asyncHandler = require('../utils/asyncHandler');

class ExpenseController {
  getAllExpenses = asyncHandler(async (req, res) => {
    const { category, startDate, endDate, search } = req.query;
    const expenses = await expenseService.getAllExpenses({ category, startDate, endDate, search });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  });

  getExpenseById = asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(200).json({ success: true, data: expense });
  });

  createExpense = asyncHandler(async (req, res) => {
    const { category, description, amount } = req.body;
    if (!category || !description || !amount) {
      return res.status(400).json({ success: false, message: 'Category, description, and amount are required' });
    }
    const expense = await expenseService.createExpense(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Expense created successfully', data: expense });
  });

  updateExpense = asyncHandler(async (req, res) => {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
  });

  deleteExpense = asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id);
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  });

  getExpenseStats = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await expenseService.getExpenseStats(startDate, endDate);
    res.status(200).json({ success: true, data: stats });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await expenseService.getExpenseCategories();
    res.status(200).json({ success: true, data: categories });
  });
}

module.exports = new ExpenseController();
