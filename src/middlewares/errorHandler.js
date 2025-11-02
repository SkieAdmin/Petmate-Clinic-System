// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma-specific errors
  if (err.code && err.code.startsWith('P')) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          message: 'A record with this unique field already exists',
          error: err.message,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          message: 'Record not found',
          error: err.message,
        });
      default:
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: err.message,
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message,
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
