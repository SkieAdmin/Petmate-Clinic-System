const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class CustomerService {
  // Register new customer
  async register(customerData) {
    const { name, email, password, phone, address } = customerData;

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      // If client exists but has no password, allow them to claim the account
      if (!existingClient.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const client = await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            password: hashedPassword,
            name: name || existingClient.name,
            phone: phone || existingClient.phone,
            address: address || existingClient.address,
            emailVerified: true,
            isActive: true,
          },
        });

        const token = this.generateToken(client);
        const { password: _, ...clientWithoutPassword } = client;

        return {
          client: clientWithoutPassword,
          token,
          message: 'Account claimed successfully! Your existing data has been linked.',
        };
      }
      throw new Error('Email already registered. Please login instead.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new client with customer portal access
    const client = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        emailVerified: true, // Skip verification for MVP
        isActive: true,
      },
    });

    // Generate JWT token
    const token = this.generateToken(client);

    // Return client data without password
    const { password: _, ...clientWithoutPassword } = client;

    return {
      client: clientWithoutPassword,
      token,
    };
  }

  // Login customer
  async login(email, password) {
    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      throw new Error('Invalid email or password');
    }

    if (!client.password) {
      throw new Error('This account does not have customer portal access. Please register first.');
    }

    if (!client.isActive) {
      throw new Error('Account is inactive. Please contact the clinic.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = this.generateToken(client);

    // Return client data without password
    const { password: _, ...clientWithoutPassword } = client;

    return {
      client: clientWithoutPassword,
      token,
    };
  }

  // Generate JWT token for customer
  generateToken(client) {
    return jwt.sign(
      {
        clientId: client.id,
        email: client.email,
        name: client.name,
        isCustomer: true, // Flag to distinguish from staff tokens
        role: 'Customer',
        permissions: [
          'customer.dashboard',
          'customer.pets.view',
          'customer.pets.create',
          'customer.appointments.view',
          'customer.appointments.create',
          'customer.invoices.view',
          'customer.profile.view',
          'customer.profile.edit',
        ],
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );
  }

  // Verify customer token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
      );

      if (!decoded.isCustomer) {
        throw new Error('Invalid customer token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Get customer profile
  async getProfile(clientId) {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
      include: {
        patients: true,
        _count: {
          select: {
            patients: true,
            invoices: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error('Customer not found');
    }

    const { password: _, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
  }

  // Update customer profile
  async updateProfile(clientId, data) {
    const { name, phone, address } = data;

    const client = await prisma.client.update({
      where: { id: parseInt(clientId) },
      data: {
        name,
        phone,
        address,
      },
    });

    const { password: _, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
  }

  // Change password
  async changePassword(clientId, oldPassword, newPassword) {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
    });

    if (!client) {
      throw new Error('Customer not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, client.password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.client.update({
      where: { id: parseInt(clientId) },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  // Get customer's pets
  async getPets(clientId) {
    return await prisma.patient.findMany({
      where: { clientId: parseInt(clientId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single pet (with ownership check)
  async getPetById(clientId, petId) {
    const pet = await prisma.patient.findFirst({
      where: {
        id: parseInt(petId),
        clientId: parseInt(clientId),
      },
      include: {
        appointments: {
          orderBy: { dateTime: 'desc' },
          take: 5,
        },
      },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    return pet;
  }

  // Add new pet
  async addPet(clientId, petData) {
    const { name, species, breed, birthDate, weight, notes } = petData;

    return await prisma.patient.create({
      data: {
        name,
        species,
        breed: breed || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
        clientId: parseInt(clientId),
      },
    });
  }

  // Get customer's appointments
  async getAppointments(clientId) {
    const pets = await prisma.patient.findMany({
      where: { clientId: parseInt(clientId) },
      select: { id: true },
    });

    const petIds = pets.map((p) => p.id);

    return await prisma.appointment.findMany({
      where: {
        patientId: { in: petIds },
      },
      include: {
        patient: true,
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  // Book appointment
  async bookAppointment(clientId, appointmentData) {
    const { patientId, dateTime, reason, notes } = appointmentData;

    // Verify pet belongs to customer
    const pet = await prisma.patient.findFirst({
      where: {
        id: parseInt(patientId),
        clientId: parseInt(clientId),
      },
    });

    if (!pet) {
      throw new Error('Pet not found or does not belong to you');
    }

    return await prisma.appointment.create({
      data: {
        patientId: parseInt(patientId),
        dateTime: new Date(dateTime),
        reason: reason || null,
        notes: notes || null,
        status: 'Pending',
      },
      include: {
        patient: true,
      },
    });
  }

  // Cancel appointment
  async cancelAppointment(clientId, appointmentId) {
    // Get appointment with pet info
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: { patient: true },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Verify pet belongs to customer
    if (appointment.patient.clientId !== parseInt(clientId)) {
      throw new Error('Appointment not found');
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'Completed') {
      throw new Error('Cannot cancel a completed appointment');
    }

    if (appointment.status === 'Canceled') {
      throw new Error('Appointment is already cancelled');
    }

    return await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: { status: 'Canceled' },
    });
  }

  // Get customer's invoices
  async getInvoices(clientId) {
    return await prisma.invoice.findMany({
      where: { clientId: parseInt(clientId) },
      include: {
        items: {
          include: { item: true },
        },
        payment: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  // Get single invoice (with ownership check)
  async getInvoiceById(clientId, invoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: parseInt(invoiceId),
        clientId: parseInt(clientId),
      },
      include: {
        items: {
          include: { item: true },
        },
        payment: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return invoice;
  }

  // Get dashboard summary
  async getDashboardSummary(clientId) {
    const pets = await prisma.patient.findMany({
      where: { clientId: parseInt(clientId) },
      select: { id: true },
    });

    const petIds = pets.map((p) => p.id);

    const [petsCount, upcomingAppointments, unpaidInvoices] = await Promise.all([
      prisma.patient.count({
        where: { clientId: parseInt(clientId) },
      }),
      prisma.appointment.findMany({
        where: {
          patientId: { in: petIds },
          dateTime: { gte: new Date() },
          status: { in: ['Pending', 'Scheduled', 'Approved'] },
        },
        include: { patient: true },
        orderBy: { dateTime: 'asc' },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          clientId: parseInt(clientId),
          status: 'Unpaid',
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      petsCount,
      upcomingAppointments,
      unpaidInvoices,
      unpaidTotal: unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    };
  }
}

module.exports = new CustomerService();
