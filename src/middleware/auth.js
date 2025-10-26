/**
 * AUTHENTICATION MIDDLEWARE
 * 
 * Handles JWT token verification and user authentication
 * for protected routes.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    console.log("authenticateToken");
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by email from token
    const { email } = decoded;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = decoded;
      const user = await User.findOne({ where: { email } });
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Check if user has specific role or permission
 * @param {string} role - Required role
 * @returns {Function} Middleware function
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // For now, all users have the same permissions
    // This can be extended for role-based access control
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
