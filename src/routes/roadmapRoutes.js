/**
 * ROADMAP ROUTES
 * 
 * Routes for roadmap operations including
 * roadmap creation, topic/subtopic management, and progress tracking.
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateUserId, 
  validateRoadmap, 
  validateTopic, 
  validateSubtopic, 
  validateId 
} = require('../middleware/validation');
const { 
  createRoadmap, 
  getUserRoadmaps, 
  getRoadmapById, 
  createTopic, 
  createSubtopic, 
  completeTopic, 
  completeSubtopic, 
  uncompleteTopic, 
  uncompleteSubtopic 
} = require('../controllers/roadmapController');

const router = express.Router();

// ========== ROADMAP ROUTES ==========

/**
 * POST /api/users/:userId/roadmaps
 * Create a new roadmap for a user
 */
router.post('/users/:userId/roadmaps', 
  authenticateToken, 
  validateUserId, 
  validateRoadmap, 
  createRoadmap
);

/**
 * GET /api/users/:userId/roadmaps
 * Get all roadmaps for a user with topics and subtopics
 */
router.get('/users/:userId/roadmaps', 
  authenticateToken, 
  validateUserId, 
  getUserRoadmaps
);

/**
 * GET /api/roadmaps/:roadmapId
 * Get single roadmap with topics and subtopics
 */
router.get('/roadmaps/:roadmapId', 
  authenticateToken, 
  validateId, 
  getRoadmapById
);

// ========== TOPIC ROUTES ==========

/**
 * POST /api/roadmaps/:roadmapId/topics
 * Create a new topic in a roadmap
 */
router.post('/roadmaps/:roadmapId/topics', 
  authenticateToken, 
  validateId, 
  validateTopic, 
  createTopic
);

/**
 * PUT /api/topics/:id/complete
 * Mark topic as completed
 */
router.put('/topics/:id/complete', 
  authenticateToken, 
  validateId, 
  completeTopic
);

/**
 * PUT /api/topics/:id/uncomplete
 * Mark topic as uncompleted
 */
router.put('/topics/:id/uncomplete', 
  authenticateToken, 
  validateId, 
  uncompleteTopic
);

// ========== SUBTOPIC ROUTES ==========

/**
 * POST /api/topics/:topicId/subtopics
 * Create a new subtopic in a topic
 */
router.post('/topics/:topicId/subtopics', 
  authenticateToken, 
  validateId, 
  validateSubtopic, 
  createSubtopic
);

/**
 * PUT /api/subtopics/:id/complete
 * Mark subtopic as completed
 */
router.put('/subtopics/:id/complete', 
  authenticateToken, 
  validateId, 
  completeSubtopic
);

/**
 * PUT /api/subtopics/:id/uncomplete
 * Mark subtopic as uncompleted
 */
router.put('/subtopics/:id/uncomplete', 
  authenticateToken, 
  validateId, 
  uncompleteSubtopic
);

module.exports = router;
