/**
 * USER ROUTES
 * 
 * Routes for user-related operations including
 * user retrieval, profile management, and statistics.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateUserId } = require('../middleware/validation');
const { getAllUsers, getUserById, getUserStats } = require('../controllers/userController');

const router = express.Router();

// ========== USER ROUTES ==========

/**
 * GET /api/users
 * Get all users with their associated problems
 */
router.get('/', getAllUsers);

/**
 * GET /users/:id
 * Get user by ID with their problems
 */
router.get('/:id', validateUserId, getUserById);

/**
 * GET /users/:userId/stats
 * Get user statistics including problems solved, time spent, and breakdowns
 */
router.get('/:userId/stats', validateUserId, getUserStats);

module.exports = router;
