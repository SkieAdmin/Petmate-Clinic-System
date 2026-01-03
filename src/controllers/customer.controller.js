const customerService = require('../services/customer.service');
const asyncHandler = require('../utils/asyncHandler');

class CustomerController {
  // ==================== AUTH ====================

  // Register
  register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await customerService.register({
      name,
      email,
      password,
      phone,
      address,
    });

    // Store customer session
    req.session.customerId = result.client.id;
    req.session.customerToken = result.token;

    res.status(201).json({
      success: true,
      message: result.message || 'Registration successful',
      data: result,
    });
  });

  // Login
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await customerService.login(email, password);

    // Store customer session
    req.session.customerId = result.client.id;
    req.session.customerToken = result.token;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  // Logout
  logout = asyncHandler(async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    });
  });

  // ==================== PROFILE ====================

  // Get current customer
  getProfile = asyncHandler(async (req, res) => {
    const client = await customerService.getProfile(req.customer.clientId);

    res.status(200).json({
      success: true,
      data: client,
    });
  });

  // Update profile
  updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const client = await customerService.updateProfile(req.customer.clientId, {
      name,
      phone,
      address,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: client,
    });
  });

  // Change password
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const result = await customerService.changePassword(
      req.customer.clientId,
      currentPassword,
      newPassword
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  // ==================== PETS ====================

  // Get all pets
  getPets = asyncHandler(async (req, res) => {
    const pets = await customerService.getPets(req.customer.clientId);

    res.status(200).json({
      success: true,
      data: pets,
      count: pets.length,
    });
  });

  // Get single pet
  getPetById = asyncHandler(async (req, res) => {
    const pet = await customerService.getPetById(
      req.customer.clientId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: pet,
    });
  });

  // Add new pet
  addPet = asyncHandler(async (req, res) => {
    const { name, species, breed, birthDate, weight, notes } = req.body;

    if (!name || !species) {
      return res.status(400).json({
        success: false,
        message: 'Pet name and species are required',
      });
    }

    const pet = await customerService.addPet(req.customer.clientId, {
      name,
      species,
      breed,
      birthDate,
      weight,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: pet,
    });
  });

  // ==================== APPOINTMENTS ====================

  // Get all appointments
  getAppointments = asyncHandler(async (req, res) => {
    const appointments = await customerService.getAppointments(
      req.customer.clientId
    );

    res.status(200).json({
      success: true,
      data: appointments,
      count: appointments.length,
    });
  });

  // Book appointment
  bookAppointment = asyncHandler(async (req, res) => {
    const { patientId, dateTime, reason, notes } = req.body;

    if (!patientId || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Pet and appointment date/time are required',
      });
    }

    // Validate date is in the future
    const appointmentDate = new Date(dateTime);
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future',
      });
    }

    const appointment = await customerService.bookAppointment(
      req.customer.clientId,
      { patientId, dateTime, reason, notes }
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Pending clinic approval.',
      data: appointment,
    });
  });

  // Cancel appointment
  cancelAppointment = asyncHandler(async (req, res) => {
    const appointment = await customerService.cancelAppointment(
      req.customer.clientId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  });

  // ==================== INVOICES ====================

  // Get all invoices
  getInvoices = asyncHandler(async (req, res) => {
    const invoices = await customerService.getInvoices(req.customer.clientId);

    res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  });

  // Get single invoice
  getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await customerService.getInvoiceById(
      req.customer.clientId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  });

  // ==================== DASHBOARD ====================

  // Get dashboard summary
  getDashboardSummary = asyncHandler(async (req, res) => {
    const summary = await customerService.getDashboardSummary(
      req.customer.clientId
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  });
}

module.exports = new CustomerController();
