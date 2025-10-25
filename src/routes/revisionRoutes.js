/**
 * REVISION ROUTES
 * 
 * Routes for spaced repetition system operations including
 * revision item creation, retrieval, and completion tracking.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateUserId, validateId } = require('../middleware/validation');
const { 
  createRevisionItem, 
  getUserRevisionItems, 
  completeRevisionItem 
} = require('../controllers/revisionController');

const router = express.Router();

// ========== REVISION ITEM ROUTES ==========

/**
 * POST /api/users/:userId/revision-items
 * Create a new revision item for spaced repetition
 */
router.post('/users/:userId/revision-items', 
  authenticateToken, 
  validateUserId, 
  createRevisionItem
);

/**
 * GET /api/users/:userId/revision-items
 * Get all revision items for a user with optional filters
 */
router.get('/users/:userId/revision-items', 
  authenticateToken, 
  validateUserId, 
  getUserRevisionItems
);

/**
 * PUT /api/revision-items/:id/complete
 * Mark revision item as completed and create next revision
 */
router.put('/revision-items/:id/complete', 
  authenticateToken, 
  validateId, 
  completeRevisionItem
);

module.exports = router;
