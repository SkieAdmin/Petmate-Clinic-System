const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Starting database cleanup...');

  try {
    // Delete in correct order to respect foreign key constraints
    console.log('Deleting invoice items...');
    await prisma.invoiceItem.deleteMany();

    console.log('Deleting payments...');
    await prisma.payment.deleteMany();

    console.log('Deleting invoices...');
    await prisma.invoice.deleteMany();

    console.log('Deleting appointments...');
    await prisma.appointment.deleteMany();

    console.log('Deleting diagnoses...');
    await prisma.diagnosis.deleteMany();

    console.log('Deleting laboratories...');
    await prisma.laboratory.deleteMany();

    console.log('Deleting treatments...');
    await prisma.treatment.deleteMany();

    console.log('Deleting prescriptions...');
    await prisma.prescription.deleteMany();

    console.log('Deleting confinements...');
    await prisma.confinement.deleteMany();

    console.log('Deleting admissions...');
    await prisma.admission.deleteMany();

    console.log('Deleting groomings...');
    await prisma.grooming.deleteMany();

    console.log('Deleting patients...');
    await prisma.patient.deleteMany();

    console.log('Deleting clients...');
    await prisma.client.deleteMany();

    console.log('Deleting items...');
    await prisma.item.deleteMany();

    console.log('Deleting users (except admin)...');
    // Keep the admin user, delete others
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@petmate.com',
        },
      },
    });

    // Don't delete roles - they're needed for the system
    console.log('Keeping roles and admin user...');

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('📝 Summary:');
    console.log('- All mock data deleted');
    console.log('- Admin user preserved (admin@petmate.com)');
    console.log('- Roles preserved (Admin, Doctor, Frontdesk, Employee)');
    console.log('\nYou can now add your own real data!');
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
