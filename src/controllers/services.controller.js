const servicesService = require('../services/services.service');
const asyncHandler = require('../utils/asyncHandler');

class ServicesController {
  getAllServices = asyncHandler(async (req, res) => {
    const { category, isActive, search } = req.query;
    const services = await servicesService.getAllServices({ category, isActive, search });
    res.status(200).json({ success: true, count: services.length, data: services });
  });

  getServiceById = asyncHandler(async (req, res) => {
    const service = await servicesService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  });

  createService = asyncHandler(async (req, res) => {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Service name and price are required' });
    }
    const service = await servicesService.createService(req.body);
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  });

  updateService = asyncHandler(async (req, res) => {
    const service = await servicesService.updateService(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  });

  deleteService = asyncHandler(async (req, res) => {
    await servicesService.deleteService(req.params.id);
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  });

  getActiveServices = asyncHandler(async (req, res) => {
    const services = await servicesService.getActiveServices();
    res.status(200).json({ success: true, count: services.length, data: services });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await servicesService.getServiceCategories();
    res.status(200).json({ success: true, data: categories });
  });

  createServiceRecord = asyncHandler(async (req, res) => {
    const { serviceId, patientId } = req.body;
    if (!serviceId || !patientId) {
      return res.status(400).json({ success: false, message: 'Service ID and patient ID are required' });
    }
    const record = await servicesService.createServiceRecord(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Service record created successfully', data: record });
  });

  getServiceRecordsByPatient = asyncHandler(async (req, res) => {
    const records = await servicesService.getServiceRecordsByPatient(req.params.patientId);
    res.status(200).json({ success: true, count: records.length, data: records });
  });

  getServiceSummary = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const summary = await servicesService.getServiceSummary(startDate, endDate);
    res.status(200).json({ success: true, data: summary });
  });
}

module.exports = new ServicesController();
