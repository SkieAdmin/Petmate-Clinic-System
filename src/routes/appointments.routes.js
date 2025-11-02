const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointments.controller');

// GET /api/appointments - Get all appointments (with optional date range)
router.get('/', appointmentController.getAllAppointments);

// GET /api/appointments/calendar - Get appointments by date range (for calendar view)
router.get('/calendar', appointmentController.getAppointmentsByDateRange);

// GET /api/appointments/today - Get today's appointments
router.get('/today', appointmentController.getTodayAppointments);

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments - Create new appointment
router.post('/', appointmentController.createAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
