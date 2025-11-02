const appointmentService = require('../services/appointments.service');
const asyncHandler = require('../utils/asyncHandler');

class AppointmentController {
  // Get all appointments
  getAllAppointments = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const appointments = await appointmentService.getAllAppointments(startDate, endDate);

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  });

  // Get appointments by date range (for calendar)
  getAppointmentsByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const appointments = await appointmentService.getAppointmentsByDateRange(
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  });

  // Get today's appointments
  getTodayAppointments = asyncHandler(async (req, res) => {
    const appointments = await appointmentService.getTodayAppointments();

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  });

  // Get appointment by ID
  getAppointmentById = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.getAppointmentById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  });

  // Create new appointment
  createAppointment = asyncHandler(async (req, res) => {
    const { dateTime, patientId } = req.body;

    if (!dateTime || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Date/time and patient ID are required',
      });
    }

    const appointment = await appointmentService.createAppointment(req.body);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment,
    });
  });

  // Update appointment
  updateAppointment = asyncHandler(async (req, res) => {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  });

  // Delete appointment
  deleteAppointment = asyncHandler(async (req, res) => {
    await appointmentService.deleteAppointment(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  });
}

module.exports = new AppointmentController();
