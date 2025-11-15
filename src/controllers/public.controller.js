const prisma = require('../utils/prisma');
const asyncHandler = require('../utils/asyncHandler');

class PublicController {
  // Book appointment (creates client, patient, and appointment)
  bookAppointment = asyncHandler(async (req, res) => {
    const {
      ownerName,
      ownerEmail,
      ownerPhone,
      petName,
      petSpecies,
      petBreed,
      appointmentDate,
      appointmentTime,
      reason,
      notes,
      fingerprint, // Browser fingerprint from client
    } = req.body;

    // Validate required fields
    if (!ownerName || !ownerEmail || !ownerPhone || !petName || !petSpecies || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields',
      });
    }

    // Get IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

    // Rate limiting: Check booking attempts (5 per IP + fingerprint in last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const attemptCount = await prisma.bookingAttempt.count({
      where: {
        OR: [
          { ipAddress: ipAddress },
          ...(fingerprint ? [{ fingerprint: fingerprint }] : []),
        ],
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    if (attemptCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Booking limit reached. You can only book up to 5 appointments per day. Please contact us directly if you need assistance.',
      });
    }

    // Check if client already exists by email
    let client = await prisma.client.findFirst({
      where: { email: ownerEmail },
    });

    // If client doesn't exist, create new client with unverified email
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
          address: null,
          emailVerified: false, // Email needs confirmation by front desk
        },
      });
    }

    // Check if patient (pet) already exists for this client
    let patient = await prisma.patient.findFirst({
      where: {
        name: petName,
        clientId: client.id,
      },
    });

    // If patient doesn't exist, create new patient
    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: petName,
          species: petSpecies,
          breed: petBreed || null,
          clientId: client.id,
        },
      });
    }

    // Create appointment
    const dateTime = `${appointmentDate}T${appointmentTime}:00`;
    const appointment = await prisma.appointment.create({
      data: {
        dateTime: new Date(dateTime),
        reason: reason,
        status: 'Pending', // Pending status for public bookings
        notes: notes || null,
        patientId: patient.id,
      },
      include: {
        patient: {
          include: {
            client: true,
          },
        },
      },
    });

    // Record booking attempt for rate limiting
    await prisma.bookingAttempt.create({
      data: {
        ipAddress: ipAddress,
        fingerprint: fingerprint || null,
        appointmentId: appointment.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! We will contact you soon to confirm.',
      data: {
        appointmentId: appointment.id,
        appointmentDate: appointment.dateTime,
        patientName: appointment.patient.name,
        clientName: appointment.patient.client.name,
      },
    });
  });
}

module.exports = new PublicController();
