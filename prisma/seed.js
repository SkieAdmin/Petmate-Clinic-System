const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.client.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  console.log('Creating roles...');

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full system access with all permissions',
      permissions: JSON.stringify([
        'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
        'patients.view', 'patients.create', 'patients.edit', 'patients.delete',
        'appointments.view', 'appointments.create', 'appointments.edit', 'appointments.delete',
        'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.delete',
        'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
        'reports.view', 'users.manage'
      ]),
    },
  });

  const doctorRole = await prisma.role.create({
    data: {
      name: 'Doctor',
      description: 'Veterinarian with access to patient care features',
      permissions: JSON.stringify([
        'patients.view', 'patients.edit',
        'appointments.view', 'appointments.edit',
        'inventory.view'
      ]),
    },
  });

  const frontdeskRole = await prisma.role.create({
    data: {
      name: 'Frontdesk',
      description: 'Front desk staff with client and appointment management',
      permissions: JSON.stringify([
        'clients.view', 'clients.create', 'clients.edit',
        'appointments.view', 'appointments.create', 'appointments.edit'
      ]),
    },
  });

  const employeeRole = await prisma.role.create({
    data: {
      name: 'Employee',
      description: 'Basic employee with limited view access',
      permissions: JSON.stringify([
        'clients.view', 'patients.view', 'appointments.view', 'inventory.view'
      ]),
    },
  });

  console.log('Creating default users...');

  // Create admin user (password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@petmate.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      phone: '(555) 999-0000',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // Create doctor user (password: admin123)
  await prisma.user.create({
    data: {
      username: 'doctor',
      email: 'doctor@petmate.com',
      password: hashedPassword,
      fullName: 'Dr. Sarah Johnson',
      phone: '(555) 888-0000',
      roleId: doctorRole.id,
      isActive: true,
    },
  });

  // Create frontdesk user (password: admin123)
  await prisma.user.create({
    data: {
      username: 'frontdesk',
      email: 'frontdesk@petmate.com',
      password: hashedPassword,
      fullName: 'Maria Garcia',
      phone: '(555) 777-0000',
      roleId: frontdeskRole.id,
      isActive: true,
    },
  });

  console.log('Creating clients...');

  // Create clients
  const client1 = await prisma.client.create({
    data: {
      name: 'John Doe',
      phone: '(555) 123-4567',
      email: 'john.doe@email.com',
      address: '123 Oak Street, Springfield, IL 62701',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Jane Smith',
      phone: '(555) 234-5678',
      email: 'jane.smith@email.com',
      address: '456 Elm Avenue, Springfield, IL 62702',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Robert Johnson',
      phone: '(555) 345-6789',
      email: 'robert.j@email.com',
      address: '789 Maple Drive, Springfield, IL 62703',
    },
  });

  const client4 = await prisma.client.create({
    data: {
      name: 'Emily Brown',
      phone: '(555) 456-7890',
      email: 'emily.brown@email.com',
      address: '321 Pine Road, Springfield, IL 62704',
    },
  });

  console.log('Creating patients...');

  // Create patients (pets)
  const rex = await prisma.patient.create({
    data: {
      name: 'Rex',
      species: 'Dog',
      breed: 'German Shepherd',
      birthDate: new Date('2019-03-15'),
      notes: 'Very friendly, loves treats',
      clientId: client1.id,
    },
  });

  const whiskers = await prisma.patient.create({
    data: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      birthDate: new Date('2021-07-22'),
      notes: 'Shy around strangers',
      clientId: client2.id,
    },
  });

  const bella = await prisma.patient.create({
    data: {
      name: 'Bella',
      species: 'Dog',
      breed: 'Labrador Retriever',
      birthDate: new Date('2020-05-10'),
      notes: 'High energy, needs regular exercise',
      clientId: client3.id,
    },
  });

  const charlie = await prisma.patient.create({
    data: {
      name: 'Charlie',
      species: 'Cat',
      breed: 'Siamese',
      birthDate: new Date('2022-01-05'),
      notes: 'Very vocal',
      clientId: client2.id,
    },
  });

  const max = await prisma.patient.create({
    data: {
      name: 'Max',
      species: 'Dog',
      breed: 'Beagle',
      birthDate: new Date('2018-11-20'),
      notes: 'Senior dog, requires special care',
      clientId: client4.id,
    },
  });

  const fluffy = await prisma.patient.create({
    data: {
      name: 'Fluffy',
      species: 'Rabbit',
      breed: 'Holland Lop',
      birthDate: new Date('2023-02-14'),
      notes: 'First time rabbit owner',
      clientId: client4.id,
    },
  });

  console.log('Creating inventory items...');

  // Create inventory items
  const rabiesVaccine = await prisma.item.create({
    data: {
      name: 'Rabies Vaccine',
      description: 'Standard rabies vaccination for dogs and cats',
      itemType: 'Product',
      quantity: 20,
      minQuantity: 5,
      price: 25.00,
    },
  });

  const dewormingMed = await prisma.item.create({
    data: {
      name: 'Deworming Medicine',
      description: 'Broad-spectrum deworming medication',
      itemType: 'Product',
      quantity: 50,
      minQuantity: 10,
      price: 15.00,
    },
  });

  const fleaTreatment = await prisma.item.create({
    data: {
      name: 'Flea & Tick Treatment',
      description: 'Monthly flea and tick prevention',
      itemType: 'Product',
      quantity: 3,
      minQuantity: 10,
      price: 35.00,
    },
  });

  const checkupService = await prisma.item.create({
    data: {
      name: 'General Checkup',
      description: 'Comprehensive physical examination',
      itemType: 'Service',
      quantity: 0,
      minQuantity: 0,
      price: 50.00,
    },
  });

  const dentalCleaning = await prisma.item.create({
    data: {
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning',
      itemType: 'Service',
      quantity: 0,
      minQuantity: 0,
      price: 150.00,
    },
  });

  const xray = await prisma.item.create({
    data: {
      name: 'X-Ray',
      description: 'Digital X-ray imaging',
      itemType: 'Service',
      quantity: 0,
      minQuantity: 0,
      price: 100.00,
    },
  });

  const antibiotics = await prisma.item.create({
    data: {
      name: 'Antibiotics (Amoxicillin)',
      description: 'Common antibiotic for infections',
      itemType: 'Product',
      quantity: 30,
      minQuantity: 15,
      price: 20.00,
    },
  });

  console.log('Creating appointments...');

  // Create appointments
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const appointment1 = await prisma.appointment.create({
    data: {
      dateTime: new Date(today.setHours(10, 0, 0, 0)),
      reason: 'Annual Vaccination',
      status: 'Scheduled',
      notes: 'Due for rabies vaccine',
      patientId: rex.id,
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      dateTime: new Date(tomorrow.setHours(14, 30, 0, 0)),
      reason: 'Checkup',
      status: 'Scheduled',
      notes: 'Regular wellness exam',
      patientId: whiskers.id,
    },
  });

  const appointment3 = await prisma.appointment.create({
    data: {
      dateTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
      reason: 'Dental Cleaning',
      status: 'Scheduled',
      notes: 'Pre-anesthetic bloodwork completed',
      patientId: bella.id,
    },
  });

  const appointment4 = await prisma.appointment.create({
    data: {
      dateTime: new Date(lastWeek.setHours(11, 0, 0, 0)),
      reason: 'Skin Issue',
      status: 'Completed',
      notes: 'Treated for flea allergy',
      patientId: max.id,
    },
  });

  console.log('Creating invoices...');

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-0001',
      clientId: client4.id,
      date: new Date(lastWeek),
      totalAmount: 120.00,
      status: 'Paid',
      notes: 'Payment received in full',
      items: {
        create: [
          {
            itemId: checkupService.id,
            quantity: 1,
            priceEach: 50.00,
            subtotal: 50.00,
          },
          {
            itemId: fleaTreatment.id,
            quantity: 2,
            priceEach: 35.00,
            subtotal: 70.00,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-0002',
      clientId: client1.id,
      date: new Date(),
      totalAmount: 75.00,
      status: 'Unpaid',
      notes: 'Payment pending',
      items: {
        create: [
          {
            itemId: checkupService.id,
            quantity: 1,
            priceEach: 50.00,
            subtotal: 50.00,
          },
          {
            itemId: rabiesVaccine.id,
            quantity: 1,
            priceEach: 25.00,
            subtotal: 25.00,
          },
        ],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-0003',
      clientId: client3.id,
      date: new Date(),
      totalAmount: 200.00,
      status: 'Unpaid',
      notes: 'Scheduled for next week',
      items: {
        create: [
          {
            itemId: dentalCleaning.id,
            quantity: 1,
            priceEach: 150.00,
            subtotal: 150.00,
          },
          {
            itemId: checkupService.id,
            quantity: 1,
            priceEach: 50.00,
            subtotal: 50.00,
          },
        ],
      },
    },
  });

  // Update inventory after invoice creation
  await prisma.item.update({
    where: { id: fleaTreatment.id },
    data: { quantity: fleaTreatment.quantity - 2 },
  });

  await prisma.item.update({
    where: { id: rabiesVaccine.id },
    data: { quantity: rabiesVaccine.quantity - 1 },
  });

  console.log('Database seed completed successfully!');
  console.log('Summary:');
  console.log('- 4 Roles created (Admin, Doctor, Frontdesk, Employee)');
  console.log('- 1 User created (admin/admin123)');
  console.log('- 4 Clients created');
  console.log('- 6 Patients created');
  console.log('- 7 Inventory items created');
  console.log('- 4 Appointments created');
  console.log('- 3 Invoices created');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
