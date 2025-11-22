const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptions.controller');

// GET /api/prescriptions - Get all prescriptions (with optional filters)
router.get('/', prescriptionController.getAllPrescriptions);

// GET /api/prescriptions/:id - Get prescription by ID
router.get('/:id', prescriptionController.getPrescriptionById);

// POST /api/prescriptions - Create new prescription
router.post('/', prescriptionController.createPrescription);

// PUT /api/prescriptions/:id - Update prescription
router.put('/:id', prescriptionController.updatePrescription);

// DELETE /api/prescriptions/:id - Delete prescription
router.delete('/:id', prescriptionController.deletePrescription);

// GET /api/prescriptions/:id/print - Print prescription
router.get('/:id/print', prescriptionController.printPrescription);

module.exports = router;
