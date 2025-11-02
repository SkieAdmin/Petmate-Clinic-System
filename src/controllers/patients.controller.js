const patientService = require('../services/patients.service');
const asyncHandler = require('../utils/asyncHandler');

class PatientController {
  // Get all patients
  getAllPatients = asyncHandler(async (req, res) => {
    const { search, clientId } = req.query;

    let patients;
    if (clientId) {
      patients = await patientService.getPatientsByClientId(clientId);
    } else {
      patients = await patientService.getAllPatients(search);
    }

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  });

  // Get patient by ID
  getPatientById = asyncHandler(async (req, res) => {
    const patient = await patientService.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  });

  // Create new patient
  createPatient = asyncHandler(async (req, res) => {
    const { name, species, clientId } = req.body;

    if (!name || !species || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, species, and client ID are required',
      });
    }

    const patient = await patientService.createPatient(req.body);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  });

  // Update patient
  updatePatient = asyncHandler(async (req, res) => {
    const patient = await patientService.updatePatient(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  });

  // Delete patient
  deletePatient = asyncHandler(async (req, res) => {
    await patientService.deletePatient(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  });
}

module.exports = new PatientController();
