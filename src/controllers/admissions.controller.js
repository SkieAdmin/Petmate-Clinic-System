const admissionService = require('../services/admissions.service');
const asyncHandler = require('../utils/asyncHandler');

class AdmissionController {
  getAllAdmissions = asyncHandler(async (req, res) => {
    const { patientId, status, admissionType, startDate, endDate, search } = req.query;
    const admissions = await admissionService.getAllAdmissions({ patientId, status, admissionType, startDate, endDate, search });
    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  });

  getAdmissionById = asyncHandler(async (req, res) => {
    const admission = await admissionService.getAdmissionById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    res.status(200).json({ success: true, data: admission });
  });

  createAdmission = asyncHandler(async (req, res) => {
    const { patientId, admissionType, reason } = req.body;
    if (!patientId || !admissionType || !reason) {
      return res.status(400).json({ success: false, message: 'Patient ID, admission type, and reason are required' });
    }
    const admission = await admissionService.createAdmission(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'Admission created successfully', data: admission });
  });

  updateAdmission = asyncHandler(async (req, res) => {
    const admission = await admissionService.updateAdmission(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Admission updated successfully', data: admission });
  });

  dischargePatient = asyncHandler(async (req, res) => {
    const { dischargeDate } = req.body;
    const admission = await admissionService.dischargePatient(req.params.id, dischargeDate);
    res.status(200).json({ success: true, message: 'Patient discharged successfully', data: admission });
  });

  deleteAdmission = asyncHandler(async (req, res) => {
    await admissionService.deleteAdmission(req.params.id);
    res.status(200).json({ success: true, message: 'Admission deleted successfully' });
  });

  addConfinementRecord = asyncHandler(async (req, res) => {
    const record = await admissionService.addConfinementRecord(req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Confinement record added', data: record });
  });

  updateConfinementRecord = asyncHandler(async (req, res) => {
    const record = await admissionService.updateConfinementRecord(req.params.confinementId, req.body);
    res.status(200).json({ success: true, message: 'Confinement record updated', data: record });
  });

  deleteConfinementRecord = asyncHandler(async (req, res) => {
    await admissionService.deleteConfinementRecord(req.params.confinementId);
    res.status(200).json({ success: true, message: 'Confinement record deleted' });
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await admissionService.getAdmissionStats();
    res.status(200).json({ success: true, data: stats });
  });

  getActiveAdmissions = asyncHandler(async (req, res) => {
    const admissions = await admissionService.getActiveAdmissions();
    res.status(200).json({ success: true, count: admissions.length, data: admissions });
  });
}

module.exports = new AdmissionController();
