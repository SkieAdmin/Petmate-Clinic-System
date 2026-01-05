const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenses.controller');

router.get('/', expenseController.getAllExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.get('/categories', expenseController.getCategories);
router.get('/:id', expenseController.getExpenseById);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
