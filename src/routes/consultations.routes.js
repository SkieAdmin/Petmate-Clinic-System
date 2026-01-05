const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultations.controller');

// GET /api/consultations - Get all consultations (with filters)
router.get('/', consultationController.getAllConsultations);

// GET /api/consultations/my - Get my consultations (for logged in doctor)
router.get('/my', consultationController.getMyConsultations);

// GET /api/consultations/today - Get today's consultations
router.get('/today', consultationController.getTodayConsultations);

// GET /api/consultations/follow-ups - Get upcoming follow-ups
router.get('/follow-ups', consultationController.getUpcomingFollowUps);

// GET /api/consultations/stats - Get consultation statistics
router.get('/stats', consultationController.getConsultationStats);

// GET /api/consultations/calendar - Get consultations for calendar view
router.get('/calendar', consultationController.getConsultationsForCalendar);

// GET /api/consultations/patient/:patientId - Get consultations by patient
router.get('/patient/:patientId', consultationController.getConsultationsByPatient);

// GET /api/consultations/doctor/:doctorId - Get consultations by doctor
router.get('/doctor/:doctorId', consultationController.getConsultationsByDoctor);

// GET /api/consultations/:id - Get consultation by ID
router.get('/:id', consultationController.getConsultationById);

// POST /api/consultations - Create new consultation
router.post('/', consultationController.createConsultation);

// PUT /api/consultations/:id - Update consultation
router.put('/:id', consultationController.updateConsultation);

// PUT /api/consultations/:id/complete - Mark consultation as completed
router.put('/:id/complete', consultationController.completeConsultation);

// PUT /api/consultations/:id/follow-up - Mark consultation for follow-up
router.put('/:id/follow-up', consultationController.markForFollowUp);

// DELETE /api/consultations/:id - Delete consultation
router.delete('/:id', consultationController.deleteConsultation);

module.exports = router;
