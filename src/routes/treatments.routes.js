const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatments.controller');

// GET /api/treatments - Get all treatments (with optional diagnosisId filter)
router.get('/', treatmentController.getAllTreatments);

// GET /api/treatments/:id - Get treatment by ID
router.get('/:id', treatmentController.getTreatmentById);

// POST /api/treatments - Create new treatment
router.post('/', treatmentController.createTreatment);

// PUT /api/treatments/:id - Update treatment
router.put('/:id', treatmentController.updateTreatment);

// DELETE /api/treatments/:id - Delete treatment
router.delete('/:id', treatmentController.deleteTreatment);

// GET /api/treatments/:id/print - Print treatment
router.get('/:id/print', treatmentController.printTreatment);

module.exports = router;
