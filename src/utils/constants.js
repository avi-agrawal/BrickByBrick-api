/**
 * APPLICATION CONSTANTS
 * 
 * Centralized constants for the application including
 * error messages, status codes, and configuration values.
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_REQUIRED: 'Access token is required',
  TOKEN_INVALID: 'Invalid token',
  TOKEN_EXPIRED: 'Token has expired',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  
  // General
  VALIDATION_FAILED: 'Validation failed',
  RESOURCE_NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  
  // Problems
  PROBLEM_NOT_FOUND: 'Problem not found',
  PROBLEM_CREATE_FAILED: 'Failed to create problem',
  PROBLEM_UPDATE_FAILED: 'Failed to update problem',
  PROBLEM_DELETE_FAILED: 'Failed to delete problem',
  
  // Learning Items
  LEARNING_ITEM_NOT_FOUND: 'Learning item not found',
  LEARNING_ITEM_CREATE_FAILED: 'Failed to create learning item',
  LEARNING_ITEM_UPDATE_FAILED: 'Failed to update learning item',
  LEARNING_ITEM_DELETE_FAILED: 'Failed to delete learning item',
  
  // Roadmaps
  ROADMAP_NOT_FOUND: 'Roadmap not found',
  ROADMAP_CREATE_FAILED: 'Failed to create roadmap',
  TOPIC_NOT_FOUND: 'Topic not found',
  SUBTOPIC_NOT_FOUND: 'Subtopic not found',
  
  // Analytics
  ANALYTICS_CALCULATION_FAILED: 'Failed to calculate analytics',
  INVALID_ANALYTICS_PARAMS: 'Invalid analytics parameters'
};

// Success Messages
const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'User created successfully',
  TOKEN_VALID: 'Token is valid',
  
  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
  
  // Problems
  PROBLEM_CREATED: 'Problem created successfully',
  PROBLEM_UPDATED: 'Problem updated successfully',
  PROBLEM_DELETED: 'Problem deleted successfully',
  
  // Learning Items
  LEARNING_ITEM_CREATED: 'Learning item created successfully',
  LEARNING_ITEM_UPDATED: 'Learning item updated successfully',
  LEARNING_ITEM_DELETED: 'Learning item deleted successfully',
  
  // Roadmaps
  ROADMAP_CREATED: 'Roadmap created successfully',
  TOPIC_CREATED: 'Topic created successfully',
  SUBTOPIC_CREATED: 'Subtopic created successfully',
  TOPIC_COMPLETED: 'Topic completed successfully',
  SUBTOPIC_COMPLETED: 'Subtopic completed successfully',
  
  // Revision
  REVISION_ITEM_CREATED: 'Revision item created successfully',
  REVISION_ITEM_COMPLETED: 'Revision item completed successfully'
};

// Validation Rules
const VALIDATION_RULES = {
  // User
  FIRST_NAME_MIN_LENGTH: 2,
  FIRST_NAME_MAX_LENGTH: 50,
  LAST_NAME_MIN_LENGTH: 2,
  LAST_NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  
  // Problem
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  TIME_SPENT_MAX: 1440, // 24 hours in minutes
  
  // Learning Item
  PROGRESS_MIN: 0,
  PROGRESS_MAX: 100,
  
  // Roadmap
  DESCRIPTION_MAX_LENGTH: 1000,
  
  // Pagination
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Problem Constants
const PROBLEM_CONSTANTS = {
  PLATFORMS: ['LeetCode', 'HackerRank', 'Codeforces', 'AtCoder', 'CodeChef', 'other'],
  DIFFICULTIES: ['easy', 'medium', 'hard'],
  OUTCOMES: ['solved', 'attempted', 'stuck', 'skipped', 'hints', 'failed']
};

// Learning Item Constants
const LEARNING_ITEM_CONSTANTS = {
  TYPES: ['course', 'book', 'tutorial', 'article', 'video', 'podcast', 'workshop', 'other'],
  STATUSES: ['not-started', 'in-progress', 'completed', 'paused'],
  DIFFICULTIES: ['beginner', 'intermediate', 'advanced']
};

// Revision Constants
const REVISION_CONSTANTS = {
  ITEM_TYPES: ['problem', 'learning'],
  INTERVALS: [1, 3, 7, 15, 30], // Days for spaced repetition
  MAX_CYCLES: 5
};

// Analytics Constants
const ANALYTICS_CONSTANTS = {
  TIMEFRAMES: ['week', 'month', 'quarter'],
  DEFAULT_TIMEFRAME: 'month',
  MAX_TOPICS_ANALYSIS: 5
};

// Database Constants
const DATABASE_CONSTANTS = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // milliseconds
  CONNECTION_TIMEOUT: 30000 // milliseconds
};

// JWT Constants
const JWT_CONSTANTS = {
  DEFAULT_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

// CORS Constants
const CORS_CONSTANTS = {
  DEFAULT_ORIGIN: 'http://localhost:5173',
  CREDENTIALS: true
};

// Session Constants
const SESSION_CONSTANTS = {
  DEFAULT_SECRET: 'your-secret-key',
  MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  SECURE_IN_PRODUCTION: true
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  PROBLEM_CONSTANTS,
  LEARNING_ITEM_CONSTANTS,
  REVISION_CONSTANTS,
  ANALYTICS_CONSTANTS,
  DATABASE_CONSTANTS,
  JWT_CONSTANTS,
  CORS_CONSTANTS,
  SESSION_CONSTANTS
};
