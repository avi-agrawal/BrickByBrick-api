/**
 * REVISION CONTROLLER
 * 
 * Handles all spaced repetition system operations including
 * revision item creation, retrieval, and completion tracking.
 */

const { User, RevisionItem, Problem, LearningItem } = require('../models');

/**
 * POST /api/users/:userId/revision-items
 * Create a new revision item for spaced repetition
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRevisionItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, itemType, originalDate, nextRevisionDate, revisionCycle } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const revisionItem = await RevisionItem.create({
      itemId,
      itemType,
      originalDate,
      nextRevisionDate,
      revisionCycle: revisionCycle || 1,
      isCompleted: false,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Revision item created successfully',
      data: revisionItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating revision item',
      error: error.message
    });
  }
};

/**
 * GET /api/users/:userId/revision-items
 * Get all revision items for a user with optional filters
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserRevisionItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, isCompleted } = req.query;

    let whereClause = { userId };

    // Add filters if provided
    if (date) whereClause.nextRevisionDate = date;
    if (isCompleted !== undefined) whereClause.isCompleted = isCompleted === 'true';

    const revisionItems = await RevisionItem.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['nextRevisionDate', 'ASC']]
    });

    // Manually fetch related problem/learning data
    const enrichedRevisionItems = await Promise.all(
      revisionItems.map(async (item) => {
        const itemData = item.toJSON();

        if (item.itemType === 'problem') {
          const problem = await Problem.findByPk(item.itemId);
          itemData.problem = problem;
        } else if (item.itemType === 'learning') {
          const learningItem = await LearningItem.findByPk(item.itemId);
          itemData.learningItem = learningItem;
        }

        return itemData;
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedRevisionItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving revision items',
      error: error.message
    });
  }
};

/**
 * PUT /api/revision-items/:id/complete
 * Mark revision item as completed and create next revision
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeRevisionItem = async (req, res) => {
  try {
    const revisionItem = await RevisionItem.findByPk(req.params.id);

    if (!revisionItem) {
      return res.status(404).json({
        success: false,
        message: 'Revision item not found'
      });
    }

    // Mark current revision as completed
    await revisionItem.update({
      isCompleted: true,
      completedDate: new Date().toISOString().split('T')[0]
    });

    // Create next revision item for the next cycle
    const intervals = [1, 3, 7, 15, 30];
    const nextCycle = revisionItem.revisionCycle + 1;
    const daysToAdd = intervals[nextCycle - 1] || 30;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    const nextRevisionItem = await RevisionItem.create({
      itemId: revisionItem.itemId,
      itemType: revisionItem.itemType,
      originalDate: revisionItem.originalDate,
      nextRevisionDate: nextDate.toISOString().split('T')[0],
      revisionCycle: nextCycle,
      isCompleted: false,
      userId: revisionItem.userId
    });

    res.status(200).json({
      success: true,
      message: 'Revision item completed successfully',
      data: {
        completed: revisionItem,
        next: nextRevisionItem
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error completing revision item',
      error: error.message
    });
  }
};

module.exports = {
  createRevisionItem,
  getUserRevisionItems,
  completeRevisionItem
};
