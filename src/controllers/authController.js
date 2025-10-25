/**
 * AUTHENTICATION CONTROLLER
 * 
 * Handles all authentication-related operations including
 * user registration, login, token verification, and OAuth flows.
 */

const { asyncHandler } = require('../middleware/errorHandler');
const { registerUser, loginUser, verifyToken } = require('../services/authService');

/**
 * POST /api/auth/login
 * User login with email and password
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result.user,
    token: result.token
  });
});

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const result = await registerUser({ firstName, lastName, email, password });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: result.user,
    token: result.token
  });
});

/**
 * POST /api/auth/verify
 * Verify JWT token and get user information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verify = asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }
  
  const user = await verifyToken(token);
  
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: user
  });
});

module.exports = {
  login,
  register,
  verify
};
