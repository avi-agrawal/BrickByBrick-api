/**
 * PROBLEM ROUTES
 * 
 * Routes for coding problem operations including
 * CRUD operations, filtering, and statistics.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateUserId, validateProblemCreation, validateId } = require('../middleware/validation');
const { 
  createProblem, 
  getUserProblems, 
  getProblemById, 
  updateProblem, 
  deleteProblem 
} = require('../controllers/problemController');

const router = express.Router();

// ========== PROBLEM ROUTES ==========

/**
 * POST /api/users/:userId/problems
 * Create a new coding problem for a user
 */
router.post('/users/:userId/problems', 
  authenticateToken, 
  validateUserId, 
  validateProblemCreation, 
  createProblem
);

/**
 * GET /api/users/:userId/problems
 * Get all problems for a specific user with optional filters
 */
router.get('/users/:userId/problems', 
  authenticateToken, 
  validateUserId, 
  getUserProblems
);

/**
 * GET /problems/:id
 * Get problem by ID
 */
router.get('/:id', validateId, getProblemById);

/**
 * PUT /problems/:id
 * Update problem
 */
router.put('/:id', 
  authenticateToken, 
  validateId, 
  updateProblem
);

/**
 * DELETE /problems/:id
 * Delete problem
 */
router.delete('/:id', 
  authenticateToken, 
  validateId, 
  deleteProblem
);

module.exports = router;
