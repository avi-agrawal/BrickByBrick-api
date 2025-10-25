/**
 * ANALYTICS ROUTES
 * 
 * Routes for analytics and insights including
 * user statistics, performance metrics, and AI recommendations.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateAnalyticsQuery } = require('../middleware/validation');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// ========== ANALYTICS ROUTES ==========

/**
 * GET /api/analytics
 * Get comprehensive analytics for a user
 */
router.get('/', 
  authenticateToken, 
  validateAnalyticsQuery, 
  getAnalytics
);

module.exports = router;
