/**
 * MAIN ROUTES INDEX
 * 
 * Central route configuration that mounts all
 * application routes with proper middleware.
 */

const express = require('express');
const { errorHandler, notFoundHandler } = require('../middleware/errorHandler');

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const problemRoutes = require('./problemRoutes');
const learningRoutes = require('./learningRoutes');
const revisionRoutes = require('./revisionRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

// Debug middleware to log route matching
router.use('/api/*', (req, res, next) => {
  console.log(`Route Debug: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', Object.keys(req.headers));
  if (req.headers.authorization) {
    console.log('Auth header present:', req.headers.authorization.substring(0, 20) + '...');
  }
  next();
});

// ========== HEALTH CHECK ==========

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ========== API ROUTES ==========

// Mount all route modules with specific paths to avoid conflicts
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/analytics', analyticsRoutes);
router.use('/api/problems', problemRoutes);
router.use('/api/learning', learningRoutes);
router.use('/api/revision', revisionRoutes);
router.use('/api/roadmap', roadmapRoutes);

// ========== ERROR HANDLING ==========

// 404 handler for API routes
router.use('/api/*', notFoundHandler);

// Global error handler
router.use(errorHandler);

module.exports = router;