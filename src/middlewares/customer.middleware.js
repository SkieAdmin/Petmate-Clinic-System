const customerService = require('../services/customer.service');

// Middleware to check if customer is authenticated
const authenticateCustomer = (req, res, next) => {
  try {
    // Check for token in Authorization header or session
    let token = req.headers.authorization?.split(' ')[1];

    if (!token && req.session?.customerToken) {
      token = req.session.customerToken;
    }

    if (!token) {
      // For API requests, return JSON error
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      // For web routes, redirect to customer login
      return res.redirect('/customer/login');
    }

    // Verify token
    const decoded = customerService.verifyToken(token);
    req.customer = decoded;
    next();
  } catch (error) {
    // For API requests, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    // For web routes, redirect to customer login
    return res.redirect('/customer/login');
  }
};

// Middleware to block customers from accessing staff routes
const blockCustomer = (req, res, next) => {
  // Check if the user is a customer (has isCustomer flag in token)
  if (req.user && req.user.isCustomer) {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff only.',
      });
    }
    return res.redirect('/customer/dashboard');
  }
  next();
};

// Middleware to redirect authenticated customers away from login/register
const redirectIfCustomerAuthenticated = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token && req.session?.customerToken) {
      token = req.session.customerToken;
    }

    if (token) {
      customerService.verifyToken(token);
      return res.redirect('/customer/dashboard');
    }

    next();
  } catch (error) {
    // Token is invalid or expired, continue to login/register
    next();
  }
};

// Middleware to check if user has customer role
const requireCustomer = (req, res, next) => {
  if (!req.customer || !req.customer.isCustomer) {
    if (req.path.startsWith('/api/')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customers only.',
      });
    }
    return res.redirect('/login');
  }
  next();
};

module.exports = {
  authenticateCustomer,
  blockCustomer,
  redirectIfCustomerAuthenticated,
  requireCustomer,
};
