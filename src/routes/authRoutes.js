/**
 * AUTHENTICATION ROUTES
 * 
 * Routes for user authentication including registration,
 * login, token verification, and OAuth flows.
 */

const express = require('express');
const passport = require('../config/oauth');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { login, register, verify } = require('../controllers/authController');

const router = express.Router();

/**
 * Generate JWT token for OAuth users
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ 
    id: user.id, 
    email: user.email,
    authProvider: user.authProvider 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// ========== LOCAL AUTHENTICATION ROUTES ==========

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', validateUserRegistration, register);

/**
 * POST /api/auth/login
 * User login with email and password
 */
router.post('/login', validateUserLogin, login);

/**
 * POST /api/auth/verify
 * Verify JWT token and get user information
 */
router.post('/verify', verify);

// ========== OAUTH AUTHENTICATION ROUTES ==========

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  /**
   * GET /api/auth/google
   * Initiate Google OAuth flow
   */
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  /**
   * GET /api/auth/google/callback
   * Handle Google OAuth callback
   */
  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
      const token = generateToken(req.user);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=google`;
      res.redirect(redirectUrl);
    }
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Google OAuth is not configured'
    });
  });
}

// GitHub OAuth routes (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  /**
   * GET /api/auth/github
   * Initiate GitHub OAuth flow
   */
  router.get('/github', passport.authenticate('github', {
    scope: ['user:email']
  }));

  /**
   * GET /api/auth/github/callback
   * Handle GitHub OAuth callback
   */
  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
    (req, res) => {
      const token = generateToken(req.user);
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&provider=github`;
      res.redirect(redirectUrl);
    }
  );
} else {
  // Fallback routes when GitHub OAuth is not configured
  router.get('/github', (req, res) => {
    res.status(501).json({
      success: false,
      message: 'GitHub OAuth is not configured'
    });
  });
}

// ========== OAUTH UTILITY ROUTES ==========

/**
 * GET /api/auth/success
 * OAuth success handler
 */
router.get('/success', (req, res) => {
  res.json({
    success: true,
    message: 'OAuth authentication successful',
    user: req.user
  });
});

/**
 * GET /api/auth/failure
 * OAuth failure handler
 */
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'OAuth authentication failed'
  });
});

/**
 * POST /api/auth/verify-oauth
 * Verify OAuth token endpoint
 */
router.post('/verify-oauth', async (req, res) => {
  try {
    const { token, provider } = req.body;
    
    if (!token || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Token and provider are required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify provider matches
    if (user.authProvider !== provider) {
      return res.status(400).json({
        success: false,
        message: 'Provider mismatch'
      });
    }

    res.json({
      success: true,
      message: 'Token verified successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      },
      token: token
    });
  } catch (error) {
    console.error('OAuth verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;