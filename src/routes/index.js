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

// Mount all route modules
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api', problemRoutes);
router.use('/api', learningRoutes);
router.use('/api', revisionRoutes);
router.use('/api', roadmapRoutes);
router.use('/api', analyticsRoutes);

// ========== ERROR HANDLING ==========

// 404 handler for API routes
router.use('/api/*', notFoundHandler);

// Global error handler
router.use(errorHandler);

module.exports = router;