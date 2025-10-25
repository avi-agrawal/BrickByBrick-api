/**
 * ROADMAP CONTROLLER
 * 
 * Handles all roadmap-related operations including
 * roadmap creation, topic/subtopic management, and progress tracking.
 */

const { User, Roadmap, Topic, Subtopic } = require('../models');

/**
 * Helper function to update topic progress
 * @param {number} topicId - Topic ID to update
 * @returns {Object} Progress statistics
 */
const updateTopicProgress = async (topicId) => {
  try {
    const totalSubtopics = await Subtopic.count({
      where: { topicId: parseInt(topicId) }
    });

    const completedSubtopics = await Subtopic.count({
      where: {
        topicId: parseInt(topicId),
        isCompleted: true
      }
    });

    await Topic.update(
      {
        totalSubtopics,
        completedSubtopics
      },
      { where: { id: topicId } }
    );

    return { totalSubtopics, completedSubtopics };
  } catch (error) {
    console.error('Error updating topic progress:', error);
    return { totalSubtopics: 0, completedSubtopics: 0 };
  }
};

/**
 * POST /api/users/:userId/roadmaps
 * Create a new roadmap for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRoadmap = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, color, isPublic } = req.body;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const roadmap = await Roadmap.create({
      title,
      description,
      color: color || '#3B82F6',
      isPublic: isPublic || false,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Roadmap created successfully',
      data: roadmap
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating roadmap',
      error: error.message
    });
  }
};

/**
 * GET /api/users/:userId/roadmaps
 * Get all roadmaps for a user with topics and subtopics
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserRoadmaps = async (req, res) => {
  try {
    const { userId } = req.params;

    const roadmaps = await Roadmap.findAll({
      where: { userId },
      include: [
        {
          model: Topic,
          as: 'topics',
          include: [
            {
              model: Subtopic,
              as: 'subtopics',
              order: [['order', 'ASC']]
            }
          ],
          order: [['order', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: roadmaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving roadmaps',
      error: error.message
    });
  }
};

/**
 * GET /api/roadmaps/:roadmapId
 * Get single roadmap with topics and subtopics
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoadmapById = async (req, res) => {
  try {
    const { roadmapId } = req.params;

    // Update last visited
    await Roadmap.update(
      { lastVisited: new Date() },
      { where: { id: roadmapId } }
    );

    const roadmap = await Roadmap.findByPk(roadmapId, {
      include: [
        {
          model: Topic,
          as: 'topics',
          include: [
            {
              model: Subtopic,
              as: 'subtopics',
              order: [['order', 'ASC']]
            }
          ],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving roadmap',
      error: error.message
    });
  }
};

/**
 * POST /api/roadmaps/:roadmapId/topics
 * Create a new topic in a roadmap
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTopic = async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const { title, description, order } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Topic title is required'
      });
    }

    const topic = await Topic.create({
      title: title.trim(),
      description: description?.trim() || null,
      order: order || 0,
      roadmapId: parseInt(roadmapId),
      totalSubtopics: 0,
      completedSubtopics: 0
    });

    res.status(201).json({
      success: true,
      message: 'Topic created successfully',
      data: topic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating topic',
      error: error.message
    });
  }
};

/**
 * POST /api/topics/:topicId/subtopics
 * Create a new subtopic in a topic
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createSubtopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title, description, order, difficulty, estimatedTime } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Subtopic title is required'
      });
    }

    const subtopic = await Subtopic.create({
      title: title.trim(),
      description: description?.trim() || null,
      order: order || 0,
      topicId: parseInt(topicId),
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || null
    });

    // Update topic progress
    await updateTopicProgress(topicId);

    res.status(201).json({
      success: true,
      message: 'Subtopic created successfully',
      data: subtopic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating subtopic',
      error: error.message
    });
  }
};

/**
 * PUT /api/topics/:id/complete
 * Mark topic as completed
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeTopic = async (req, res) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    await topic.update({
      isCompleted: true,
      completedDate: new Date().toISOString().split('T')[0]
    });

    res.status(200).json({
      success: true,
      message: 'Topic completed successfully',
      data: topic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error completing topic',
      error: error.message
    });
  }
};

/**
 * PUT /api/subtopics/:id/complete
 * Mark subtopic as completed
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeSubtopic = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByPk(req.params.id);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        message: 'Subtopic not found'
      });
    }

    await subtopic.update({
      isCompleted: true,
      completedDate: new Date().toISOString().split('T')[0]
    });

    // Update topic progress
    await updateTopicProgress(subtopic.topicId);

    res.status(200).json({
      success: true,
      message: 'Subtopic completed successfully',
      data: subtopic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error completing subtopic',
      error: error.message
    });
  }
};

/**
 * PUT /api/topics/:id/uncomplete
 * Mark topic as uncompleted
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uncompleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByPk(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    await topic.update({
      isCompleted: false,
      completedDate: null
    });

    res.status(200).json({
      success: true,
      message: 'Topic uncompleted successfully',
      data: topic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error uncompleting topic',
      error: error.message
    });
  }
};

/**
 * PUT /api/subtopics/:id/uncomplete
 * Mark subtopic as uncompleted
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uncompleteSubtopic = async (req, res) => {
  try {
    const subtopic = await Subtopic.findByPk(req.params.id);
    if (!subtopic) {
      return res.status(404).json({
        success: false,
        message: 'Subtopic not found'
      });
    }

    await subtopic.update({
      isCompleted: false,
      completedDate: null
    });

    // Update topic progress
    await updateTopicProgress(subtopic.topicId);

    res.status(200).json({
      success: true,
      message: 'Subtopic uncompleted successfully',
      data: subtopic
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error uncompleting subtopic',
      error: error.message
    });
  }
};

module.exports = {
  createRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  createTopic,
  createSubtopic,
  completeTopic,
  completeSubtopic,
  uncompleteTopic,
  uncompleteSubtopic
};
