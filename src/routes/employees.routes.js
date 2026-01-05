const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employees.controller');

router.get('/', employeeController.getAllEmployees);
router.get('/stats', employeeController.getStats);
router.get('/departments', employeeController.getDepartments);
router.get('/user/:userId', employeeController.getEmployeeByUserId);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.put('/:id/terminate', employeeController.terminateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
