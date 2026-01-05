const consultationService = require('../services/consultations.service');
const asyncHandler = require('../utils/asyncHandler');

class ConsultationController {
  // Get all consultations
  getAllConsultations = asyncHandler(async (req, res) => {
    const { patientId, doctorId, status, startDate, endDate, search } = req.query;

    const consultations = await consultationService.getAllConsultations({
      patientId,
      doctorId,
      status,
      startDate,
      endDate,
      search,
    });

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });

  // Get consultations by patient ID
  getConsultationsByPatient = asyncHandler(async (req, res) => {
    const consultations = await consultationService.getConsultationsByPatientId(req.params.patientId);

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });

  // Get consultations by doctor ID
  getConsultationsByDoctor = asyncHandler(async (req, res) => {
    const doctorId = req.params.doctorId || req.user.id;
    const consultations = await consultationService.getConsultationsByDoctorId(doctorId);

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });

  // Get my consultations (for logged in doctor)
  getMyConsultations = asyncHandler(async (req, res) => {
    const consultations = await consultationService.getConsultationsByDoctorId(req.user.id);

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });

  // Get consultation by ID
  getConsultationById = asyncHandler(async (req, res) => {
    const consultation = await consultationService.getConsultationById(req.params.id);

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: consultation,
    });
  });

  // Create new consultation
  createConsultation = asyncHandler(async (req, res) => {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
    }

    // Set the doctor ID to the current user if not provided
    const consultationData = {
      ...req.body,
      doctorId: req.body.doctorId || req.user.id,
    };

    const consultation = await consultationService.createConsultation(consultationData);

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: consultation,
    });
  });

  // Update consultation
  updateConsultation = asyncHandler(async (req, res) => {
    const consultation = await consultationService.updateConsultation(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Consultation updated successfully',
      data: consultation,
    });
  });

  // Mark consultation as completed
  completeConsultation = asyncHandler(async (req, res) => {
    const consultation = await consultationService.completeConsultation(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Consultation marked as completed',
      data: consultation,
    });
  });

  // Mark consultation for follow-up
  markForFollowUp = asyncHandler(async (req, res) => {
    const { nextCheckUpDate } = req.body;

    if (!nextCheckUpDate) {
      return res.status(400).json({
        success: false,
        message: 'Next check-up date is required',
      });
    }

    const consultation = await consultationService.markForFollowUp(req.params.id, nextCheckUpDate);

    res.status(200).json({
      success: true,
      message: 'Consultation marked for follow-up',
      data: consultation,
    });
  });

  // Delete consultation
  deleteConsultation = asyncHandler(async (req, res) => {
    await consultationService.deleteConsultation(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully',
    });
  });

  // Get upcoming follow-ups
  getUpcomingFollowUps = asyncHandler(async (req, res) => {
    const doctorId = req.query.doctorId || (req.user.role?.name === 'Doctor' ? req.user.id : null);
    const followUps = await consultationService.getUpcomingFollowUps(doctorId);

    res.status(200).json({
      success: true,
      count: followUps.length,
      data: followUps,
    });
  });

  // Get today's consultations
  getTodayConsultations = asyncHandler(async (req, res) => {
    const doctorId = req.query.doctorId || (req.user.role?.name === 'Doctor' ? req.user.id : null);
    const consultations = await consultationService.getTodayConsultations(doctorId);

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });

  // Get consultation statistics
  getConsultationStats = asyncHandler(async (req, res) => {
    const doctorId = req.query.doctorId || (req.user.role?.name === 'Doctor' ? req.user.id : null);
    const stats = await consultationService.getConsultationStats(doctorId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Get consultations for calendar
  getConsultationsForCalendar = asyncHandler(async (req, res) => {
    const { startDate, endDate, doctorId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const doctor = doctorId || (req.user.role?.name === 'Doctor' ? req.user.id : null);
    const consultations = await consultationService.getConsultationsForCalendar(startDate, endDate, doctor);

    res.status(200).json({
      success: true,
      count: consultations.length,
      data: consultations,
    });
  });
}

module.exports = new ConsultationController();
