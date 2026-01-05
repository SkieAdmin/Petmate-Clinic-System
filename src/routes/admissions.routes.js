const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissions.controller');

router.get('/', admissionController.getAllAdmissions);
router.get('/stats', admissionController.getStats);
router.get('/active', admissionController.getActiveAdmissions);
router.get('/:id', admissionController.getAdmissionById);
router.post('/', admissionController.createAdmission);
router.put('/:id', admissionController.updateAdmission);
router.put('/:id/discharge', admissionController.dischargePatient);
router.delete('/:id', admissionController.deleteAdmission);

// Confinement records
router.post('/:id/confinements', admissionController.addConfinementRecord);
router.put('/:id/confinements/:confinementId', admissionController.updateConfinementRecord);
router.delete('/:id/confinements/:confinementId', admissionController.deleteConfinementRecord);

module.exports = router;
