/**
 * PROBLEM CONTROLLER
 * 
 * Handles all coding problem-related operations including
 * CRUD operations, filtering, and spaced repetition integration.
 */

const { User, Problem, RevisionItem } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/users/:userId/problems
 * Create a new coding problem for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProblem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, platform, difficulty, topic, timeSpent, outcome, date, link, tags, isRevision, codeLink } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create the problem in database
    const problem = await Problem.create({
      title,
      platform,
      difficulty,
      topic,
      timeSpent,
      outcome,
      date: date || new Date(),
      link,
      tags: tags || [],
      isRevision: isRevision || false,
      userId,
      codeLink
    });

    // If marked for revision, create spaced repetition schedule
    // Uses spaced repetition algorithm: 1 day, 3 days, 7 days, 15 days, 30 days
    if (isRevision) {
      const today = new Date();
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(today.getDate() + 1); // First revision next day

      await RevisionItem.create({
        itemId: problem.id,
        itemType: 'problem',
        originalDate: problem.date,
        nextRevisionDate: nextRevisionDate.toISOString().split('T')[0],
        revisionCycle: 1, // Start with cycle 1
        isCompleted: false,
        userId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: problem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating problem',
      error: error.message
    });
  }
};

/**
 * GET /api/users/:userId/problems
 * Get all problems for a specific user with optional filters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProblems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { difficulty, platform, outcome, topic } = req.query;

    // Build where clause for filtering
    let whereClause = { userId };

    // Add filters if provided in query params
    if (difficulty) whereClause.difficulty = difficulty;
    if (platform) whereClause.platform = platform;
    if (outcome) whereClause.outcome = outcome;
    if (topic) whereClause.topic = { [Op.like]: `%${topic}%` }; // Case-insensitive partial match

    const problems = await Problem.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving problems',
      error: error.message
    });
  }
};

/**
 * GET /problems/:id
 * Get problem by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving problem',
      error: error.message
    });
  }
};

/**
 * PUT /problems/:id
 * Update problem
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    await problem.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating problem',
      error: error.message
    });
  }
};

/**
 * DELETE /problems/:id
 * Delete problem
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByPk(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    await problem.destroy();

    res.status(200).json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting problem',
      error: error.message
    });
  }
};

module.exports = {
  createProblem,
  getUserProblems,
  getProblemById,
  updateProblem,
  deleteProblem
};
