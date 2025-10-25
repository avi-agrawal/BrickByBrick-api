/**
 * USER CONTROLLER
 * 
 * Handles all user-related operations including
 * user retrieval, profile management, and user statistics.
 */

const { User, Problem, sequelize } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { getUserProblemStats } = require('../services/problemService');

/**
 * GET /api/users
 * Get all users with their associated problems
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    include: [{
      model: Problem,
      as: 'problems'
    }]
  });

  res.status(200).json({
    success: true,
    data: users
  });
});

/**
 * GET /users/:id
 * Get user by ID with their problems
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{
      model: Problem,
      as: 'problems',
      order: [['date', 'DESC']]
    }]
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * GET /users/:userId/stats
 * Get user statistics including problems solved, time spent, and breakdowns
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const stats = await getUserProblemStats(userId);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  getUserStats
};
