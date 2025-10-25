/**
 * LEARNING CONTROLLER
 * 
 * Handles all learning item-related operations including
 * CRUD operations, progress tracking, and spaced repetition integration.
 */

const { User, LearningItem, RevisionItem } = require('../models');
const { Op } = require('sequelize');

/**
 * POST /api/users/:userId/learning-items
 * Create a new learning item for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLearningItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, type, category, subtopic, timeSpent, progress, status, link, tags, notes, resourceLink, isRevision, difficulty, platform } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const learningItem = await LearningItem.create({
      title,
      type,
      category,
      subtopic,
      timeSpent: timeSpent || 0,
      progress: progress || 0,
      status: status || 'not-started',
      date: new Date(),
      link,
      tags: tags || '',
      notes,
      resourceLink,
      isRevision: isRevision || false,
      difficulty,
      platform,
      userId
    });

    // Create revision item only if explicitly marked for revision
    if (isRevision) {
      const today = new Date();
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(today.getDate() + 1); // First revision next day

      await RevisionItem.create({
        itemId: learningItem.id,
        itemType: 'learning',
        originalDate: learningItem.date,
        nextRevisionDate: nextRevisionDate.toISOString().split('T')[0],
        revisionCycle: 1,
        isCompleted: false,
        userId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Learning item created successfully',
      data: learningItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating learning item',
      error: error.message
    });
  }
};

/**
 * GET /api/users/:userId/learning-items
 * Get all learning items for a user with optional filters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserLearningItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, category, status, difficulty } = req.query;

    let whereClause = { userId };

    // Add filters if provided
    if (type) whereClause.type = type;
    if (category) whereClause.category = { [Op.like]: `%${category}%` };
    if (status) whereClause.status = status;
    if (difficulty) whereClause.difficulty = difficulty;

    const learningItems = await LearningItem.findAll({
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
      data: learningItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving learning items',
      error: error.message
    });
  }
};

/**
 * PUT /api/learning-items/:id
 * Update learning item
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLearningItem = async (req, res) => {
  try {
    const learningItem = await LearningItem.findByPk(req.params.id);

    if (!learningItem) {
      return res.status(404).json({
        success: false,
        message: 'Learning item not found'
      });
    }

    await learningItem.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Learning item updated successfully',
      data: learningItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating learning item',
      error: error.message
    });
  }
};

/**
 * DELETE /api/learning-items/:id
 * Delete learning item
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLearningItem = async (req, res) => {
  try {
    const learningItem = await LearningItem.findByPk(req.params.id);

    if (!learningItem) {
      return res.status(404).json({
        success: false,
        message: 'Learning item not found'
      });
    }

    await learningItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Learning item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting learning item',
      error: error.message
    });
  }
};

module.exports = {
  createLearningItem,
  getUserLearningItems,
  updateLearningItem,
  deleteLearningItem
};
