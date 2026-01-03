const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const {
  authenticateCustomer,
  redirectIfCustomerAuthenticated,
} = require('../middlewares/customer.middleware');

// ==================== PUBLIC AUTH ROUTES ====================
router.post('/register', customerController.register);
router.post('/login', customerController.login);

// ==================== PROTECTED API ROUTES ====================
router.post('/logout', authenticateCustomer, customerController.logout);
router.get('/me', authenticateCustomer, customerController.getProfile);
router.put('/profile', authenticateCustomer, customerController.updateProfile);
router.put('/change-password', authenticateCustomer, customerController.changePassword);

// Dashboard
router.get('/dashboard/summary', authenticateCustomer, customerController.getDashboardSummary);

// Pets
router.get('/pets', authenticateCustomer, customerController.getPets);
router.post('/pets', authenticateCustomer, customerController.addPet);
router.get('/pets/:id', authenticateCustomer, customerController.getPetById);

// Appointments
router.get('/appointments', authenticateCustomer, customerController.getAppointments);
router.post('/appointments', authenticateCustomer, customerController.bookAppointment);
router.put('/appointments/:id/cancel', authenticateCustomer, customerController.cancelAppointment);

// Invoices
router.get('/invoices', authenticateCustomer, customerController.getInvoices);
router.get('/invoices/:id', authenticateCustomer, customerController.getInvoiceById);

module.exports = router;
