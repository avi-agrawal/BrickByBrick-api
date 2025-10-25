/**
 * PROBLEM SERVICE
 * 
 * Business logic for coding problem operations including
 * CRUD operations, filtering, and spaced repetition integration.
 */

const { User, Problem, RevisionItem, sequelize } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create a new problem for a user
 * @param {number} userId - User ID
 * @param {Object} problemData - Problem data
 * @returns {Object} Created problem
 */
const createProblem = async (userId, problemData) => {
  try {
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create problem
    const problem = await Problem.create({
      ...problemData,
      userId,
      date: problemData.date || new Date()
    });

    // Create revision item if marked for revision
    if (problemData.isRevision) {
      const today = new Date();
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(today.getDate() + 1);

      await RevisionItem.create({
        itemId: problem.id,
        itemType: 'problem',
        originalDate: problem.date,
        nextRevisionDate: nextRevisionDate.toISOString().split('T')[0],
        revisionCycle: 1,
        isCompleted: false,
        userId
      });
    }

    return problem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to create problem', 500);
  }
};

/**
 * Get problems for a user with filters
 * @param {number} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Array} Array of problems
 */
const getUserProblems = async (userId, filters = {}) => {
  try {
    const { difficulty, platform, outcome, topic, limit, offset } = filters;
    
    // Build where clause
    let whereClause = { userId };
    
    if (difficulty) whereClause.difficulty = difficulty;
    if (platform) whereClause.platform = platform;
    if (outcome) whereClause.outcome = outcome;
    if (topic) whereClause.topic = { [Op.like]: `%${topic}%` };

    const problems = await Problem.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName']
      }],
      order: [['date', 'DESC']],
      limit: limit || null,
      offset: offset || 0
    });

    return problems;
  } catch (error) {
    throw new AppError('Failed to retrieve problems', 500);
  }
};

/**
 * Get problem by ID
 * @param {number} problemId - Problem ID
 * @returns {Object} Problem data
 */
const getProblemById = async (problemId) => {
  try {
    const problem = await Problem.findByPk(problemId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return problem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to retrieve problem', 500);
  }
};

/**
 * Update problem
 * @param {number} problemId - Problem ID
 * @param {Object} updateData - Update data
 * @returns {Object} Updated problem
 */
const updateProblem = async (problemId, updateData) => {
  try {
    const problem = await Problem.findByPk(problemId);
    
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    await problem.update(updateData);
    return problem;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to update problem', 500);
  }
};

/**
 * Delete problem
 * @param {number} problemId - Problem ID
 * @returns {boolean} Success status
 */
const deleteProblem = async (problemId) => {
  try {
    const problem = await Problem.findByPk(problemId);
    
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    await problem.destroy();
    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to delete problem', 500);
  }
};

/**
 * Get user problem statistics
 * @param {number} userId - User ID
 * @returns {Object} Statistics data
 */
const getUserProblemStats = async (userId) => {
  try {
    const totalProblems = await Problem.count({ where: { userId } });
    const solvedProblems = await Problem.count({ 
      where: { userId, outcome: 'solved' } 
    });
    const totalTimeSpent = await Problem.sum('timeSpent', { where: { userId } });

    const difficultyStats = await Problem.findAll({
      where: { userId },
      attributes: [
        'difficulty',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['difficulty'],
      raw: true
    });

    const platformStats = await Problem.findAll({
      where: { userId },
      attributes: [
        'platform',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['platform'],
      raw: true
    });

    return {
      totalProblems,
      solvedProblems,
      totalTimeSpent: totalTimeSpent || 0,
      solveRate: totalProblems > 0 ? ((solvedProblems / totalProblems) * 100).toFixed(2) : 0,
      difficultyBreakdown: difficultyStats,
      platformBreakdown: platformStats
    };
  } catch (error) {
    throw new AppError('Failed to retrieve problem statistics', 500);
  }
};

module.exports = {
  createProblem,
  getUserProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
  getUserProblemStats
};
