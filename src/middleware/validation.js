/**
 * VALIDATION MIDDLEWARE
 * 
 * Handles request validation and sanitization
 * for API endpoints.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 4, max: 100 })
    .withMessage('Password must be between 4 and 100 characters'),
  
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Problem creation validation
 */
const validateProblemCreation = [
  body('title')
    .notEmpty()
    .withMessage('Problem title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('platform')
    .isIn(['LeetCode', 'HackerRank', 'Codeforces', 'AtCoder', 'CodeChef', 'other'])
    .withMessage('Invalid platform'),
  
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  
  body('topic')
    .notEmpty()
    .withMessage('Topic is required'),
  
  body('timeSpent')
    .isInt({ min: 0, max: 1440 })
    .withMessage('Time spent must be between 0 and 1440 minutes'),
  
  body('outcome')
    .isIn(['solved', 'attempted', 'stuck', 'skipped', 'hints', "failed"])
    .withMessage('Invalid outcome'),
  
  body('link')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
  
  body('codeLink')
    .optional()
    .isURL()
    .withMessage('Invalid URL format'),
  
  handleValidationErrors
];

/**
 * Learning item validation
 */
const validateLearningItem = [
  body('title')
    .notEmpty()
    .withMessage('Learning item title is required'),
  
  body('type')
    .isIn(['course', 'book', 'tutorial', 'article', 'video', 'podcast', 'workshop', 'other'])
    .withMessage('Invalid learning item type'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required'),
  
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('status')
    .optional()
    .isIn(['not-started', 'in-progress', 'completed', 'paused'])
    .withMessage('Invalid status'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  handleValidationErrors
];

/**
 * Roadmap validation
 */
const validateRoadmap = [
  body('title')
    .notEmpty()
    .withMessage('Roadmap title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Invalid color format'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  
  handleValidationErrors
];

/**
 * Topic validation
 */
const validateTopic = [
  body('title')
    .notEmpty()
    .withMessage('Topic title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * Subtopic validation
 */
const validateSubtopic = [
  body('title')
    .notEmpty()
    .withMessage('Subtopic title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated time must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),
  
  handleValidationErrors
];

/**
 * User ID parameter validation
 */
const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID parameter'),
  
  handleValidationErrors
];

/**
 * Analytics query validation
 */
const validateAnalyticsQuery = [
  query('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  
  query('timeframe')
    .optional()
    .isIn(['week', 'month', 'quarter'])
    .withMessage('Invalid timeframe'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateProblemCreation,
  validateLearningItem,
  validateRoadmap,
  validateTopic,
  validateSubtopic,
  validateId,
  validateUserId,
  validateAnalyticsQuery
};
