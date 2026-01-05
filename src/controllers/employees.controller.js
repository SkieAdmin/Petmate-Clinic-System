const employeeService = require('../services/employees.service');
const asyncHandler = require('../utils/asyncHandler');

class EmployeeController {
  getAllEmployees = asyncHandler(async (req, res) => {
    const { status, department, search } = req.query;
    const employees = await employeeService.getAllEmployees({ status, department, search });
    res.status(200).json({ success: true, count: employees.length, data: employees });
  });

  getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.status(200).json({ success: true, data: employee });
  });

  getEmployeeByUserId = asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeByUserId(req.params.userId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found for this user' });
    }
    res.status(200).json({ success: true, data: employee });
  });

  createEmployee = asyncHandler(async (req, res) => {
    const { userId, position } = req.body;
    if (!userId || !position) {
      return res.status(400).json({ success: false, message: 'User ID and position are required' });
    }
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, message: 'Employee record created successfully', data: employee });
  });

  updateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
  });

  terminateEmployee = asyncHandler(async (req, res) => {
    const { terminationDate } = req.body;
    const employee = await employeeService.terminateEmployee(req.params.id, terminationDate);
    res.status(200).json({ success: true, message: 'Employee terminated', data: employee });
  });

  deleteEmployee = asyncHandler(async (req, res) => {
    await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({ success: true, message: 'Employee record deleted successfully' });
  });

  getDepartments = asyncHandler(async (req, res) => {
    const departments = await employeeService.getDepartments();
    res.status(200).json({ success: true, data: departments });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await employeeService.getEmployeeStats();
    res.status(200).json({ success: true, data: stats });
  });
}

module.exports = new EmployeeController();
