const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  // Login
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);

    // Store user session
    req.session.userId = result.user.id;
    req.session.token = result.token;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  });

  // Register
  register = asyncHandler(async (req, res) => {
    const { username, email, password, fullName, phone, roleId } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required',
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await authService.register({
      username,
      email,
      password,
      fullName,
      phone,
      roleId: roleId ? parseInt(roleId) : undefined,
    });

    // Store user session
    req.session.userId = result.user.id;
    req.session.token = result.token;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
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

  // Get current user
  getCurrentUser = asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  });

  // Get all roles
  getRoles = asyncHandler(async (req, res) => {
    const roles = await authService.getRoles();

    res.status(200).json({
      success: true,
      data: roles,
    });
  });
}

module.exports = new AuthController();
