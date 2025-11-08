const authService = require('../services/auth.service');

// Middleware to check if user is authenticated
const authenticate = (req, res, next) => {
  try {
    // Check for token in Authorization header or session
    let token = req.headers.authorization?.split(' ')[1];

    if (!token && req.session?.token) {
      token = req.session.token;
    }

    if (!token) {
      // For API requests, return JSON error
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      // For web routes, redirect to login
      return res.redirect('/login');
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // For API requests, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    // For web routes, redirect to login
    return res.redirect('/login');
  }
};

// Middleware to check if user has specific permission
const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have the required role to access this resource',
      });
    }

    next();
  };
};

// Middleware to check if user is already authenticated (for login/register pages)
const redirectIfAuthenticated = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];

    if (!token && req.session?.token) {
      token = req.session.token;
    }

    if (token) {
      authService.verifyToken(token);
      return res.redirect('/');
    }

    next();
  } catch (error) {
    // Token is invalid or expired, continue to login/register
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
  redirectIfAuthenticated,
};
