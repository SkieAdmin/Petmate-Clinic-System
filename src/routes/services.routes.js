const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');

router.get('/', servicesController.getAllServices);
router.get('/active', servicesController.getActiveServices);
router.get('/categories', servicesController.getCategories);
router.get('/summary', servicesController.getServiceSummary);
router.get('/records/patient/:patientId', servicesController.getServiceRecordsByPatient);
router.get('/:id', servicesController.getServiceById);
router.post('/', servicesController.createService);
router.post('/records', servicesController.createServiceRecord);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router;
