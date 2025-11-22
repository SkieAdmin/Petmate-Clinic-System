const treatmentService = require('../services/treatments.service');
const asyncHandler = require('../utils/asyncHandler');

class TreatmentController {
  // Get all treatments
  getAllTreatments = asyncHandler(async (req, res) => {
    const { diagnosisId } = req.query;
    const treatments = await treatmentService.getAllTreatments(diagnosisId);

    res.status(200).json({
      success: true,
      count: treatments.length,
      data: treatments,
    });
  });

  // Get treatment by ID
  getTreatmentById = asyncHandler(async (req, res) => {
    const treatment = await treatmentService.getTreatmentById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: treatment,
    });
  });

  // Create new treatment
  createTreatment = asyncHandler(async (req, res) => {
    const treatment = await treatmentService.createTreatment(req.body);

    res.status(201).json({
      success: true,
      message: 'Treatment created successfully',
      data: treatment,
    });
  });

  // Update treatment
  updateTreatment = asyncHandler(async (req, res) => {
    const treatment = await treatmentService.updateTreatment(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Treatment updated successfully',
      data: treatment,
    });
  });

  // Delete treatment
  deleteTreatment = asyncHandler(async (req, res) => {
    await treatmentService.deleteTreatment(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Treatment deleted successfully',
    });
  });

  // Print treatment (Tx)
  printTreatment = asyncHandler(async (req, res) => {
    const treatment = await treatmentService.getTreatmentById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        success: false,
        message: 'Treatment not found',
      });
    }

    // Render print template
    res.render('print-treatment', {
      treatment,
      patient: treatment.diagnosis.patient,
      client: treatment.diagnosis.patient.client,
      doctor: treatment.diagnosis.doctor,
      diagnosis: treatment.diagnosis,
      printDate: new Date(),
    });
  });
}

module.exports = new TreatmentController();
