const prescriptionService = require('../services/prescriptions.service');
const asyncHandler = require('../utils/asyncHandler');

class PrescriptionController {
  // Get all prescriptions
  getAllPrescriptions = asyncHandler(async (req, res) => {
    const { diagnosisId, patientId } = req.query;
    const prescriptions = await prescriptionService.getAllPrescriptions(diagnosisId, patientId);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  });

  // Get prescription by ID
  getPrescriptionById = asyncHandler(async (req, res) => {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  });

  // Create new prescription
  createPrescription = asyncHandler(async (req, res) => {
    const prescription = await prescriptionService.createPrescription(req.body);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: prescription,
    });
  });

  // Update prescription
  updatePrescription = asyncHandler(async (req, res) => {
    const prescription = await prescriptionService.updatePrescription(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: prescription,
    });
  });

  // Delete prescription
  deletePrescription = asyncHandler(async (req, res) => {
    await prescriptionService.deletePrescription(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully',
    });
  });

  // Print prescription (Rx)
  printPrescription = asyncHandler(async (req, res) => {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      });
    }

    // Render print template
    res.render('print-prescription', {
      prescription,
      patient: prescription.diagnosis.patient,
      client: prescription.diagnosis.patient.client,
      doctor: prescription.diagnosis.doctor,
      diagnosis: prescription.diagnosis,
      printDate: new Date(),
    });
  });
}

module.exports = new PrescriptionController();
