/**
 * LEARNING ROUTES
 * 
 * Routes for learning item operations including
 * CRUD operations, progress tracking, and filtering.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateUserId, validateLearningItem, validateId } = require('../middleware/validation');
const { 
  createLearningItem, 
  getUserLearningItems, 
  updateLearningItem, 
  deleteLearningItem 
} = require('../controllers/learningController');

const router = express.Router();

// ========== LEARNING ITEM ROUTES ==========

/**
 * POST /api/users/:userId/learning-items
 * Create a new learning item for a user
 */
router.post('/users/:userId/learning-items', 
  authenticateToken, 
  validateUserId, 
  validateLearningItem, 
  createLearningItem
);

/**
 * GET /api/users/:userId/learning-items
 * Get all learning items for a user with optional filters
 */
router.get('/users/:userId/learning-items', 
  authenticateToken, 
  validateUserId, 
  getUserLearningItems
);

/**
 * PUT /api/learning-items/:id
 * Update learning item
 */
router.put('/learning-items/:id', 
  authenticateToken, 
  validateId, 
  updateLearningItem
);

/**
 * DELETE /api/learning-items/:id
 * Delete learning item
 */
router.delete('/learning-items/:id', 
  authenticateToken, 
  validateId, 
  deleteLearningItem
);

module.exports = router;
