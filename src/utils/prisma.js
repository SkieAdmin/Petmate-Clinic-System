const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

module.exports = prisma;
