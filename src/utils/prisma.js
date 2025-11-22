const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client with optimized connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error'] : [], // Reduce logging
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection pool optimization
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✓ Database connected successfully');
    }
  })
  .catch((err) => {
    console.error('✗ Database connection failed:', err);
  });

module.exports = prisma;
