/**
 * MODELS INDEX
 * 
 * This file initializes all Sequelize models and defines their associations.
 * It establishes the relationships between User, Problem, LearningItem,
 * RevisionItem, Roadmap, Topic, and Subtopic models.
 */

const sequelize = require('../config/database');
const UserModel = require('./User');
const ProblemModel = require('./Problem');
const LearningItemModel = require('./LearningItem');
const RevisionItemModel = require('./RevisionItem');
const RoadmapModel = require('./Roadmap');
const TopicModel = require('./Topic');
const SubtopicModel = require('./Subtopic');

// Initialize models
const User = UserModel(sequelize);
const Problem = ProblemModel(sequelize);
const LearningItem = LearningItemModel(sequelize);
const RevisionItem = RevisionItemModel(sequelize);
const Roadmap = RoadmapModel(sequelize);
const Topic = TopicModel(sequelize);
const Subtopic = SubtopicModel(sequelize);

// ========== MODEL ASSOCIATIONS ==========

// User-Problem associations (one-to-many)
User.hasMany(Problem, {
  foreignKey: 'userId',
  as: 'problems',
  onDelete: 'CASCADE' // Delete all problems when user is deleted
});

Problem.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User-LearningItem associations (one-to-many)
User.hasMany(LearningItem, {
  foreignKey: 'userId',
  as: 'learningItems',
  onDelete: 'CASCADE' // Delete all learning items when user is deleted
});

LearningItem.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User-RevisionItem associations (one-to-many)
User.hasMany(RevisionItem, {
  foreignKey: 'userId',
  as: 'revisionItems',
  onDelete: 'CASCADE' // Delete all revision items when user is deleted
});

RevisionItem.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Note: RevisionItem associations with Problem and LearningItem are handled manually
// in the API endpoints to avoid complex polymorphic associations

// ========== ROADMAP HIERARCHY ASSOCIATIONS ==========

// User-Roadmap associations (one-to-many)
User.hasMany(Roadmap, {
  foreignKey: 'userId',
  as: 'roadmaps',
  onDelete: 'CASCADE' // Delete all roadmaps when user is deleted
});

Roadmap.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Roadmap-Topic associations (one-to-many)
Roadmap.hasMany(Topic, {
  foreignKey: 'roadmapId',
  as: 'topics',
  onDelete: 'CASCADE' // Delete all topics when roadmap is deleted
});

Topic.belongsTo(Roadmap, {
  foreignKey: 'roadmapId',
  as: 'roadmap'
});

// Topic-Subtopic associations (one-to-many)
Topic.hasMany(Subtopic, {
  foreignKey: 'topicId',
  as: 'subtopics',
  onDelete: 'CASCADE' // Delete all subtopics when topic is deleted
});

Subtopic.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

// Simplified: No nested subtopics, only direct children of topics
// Removed self-referencing associations for simplicity

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  Problem,
  LearningItem,
  RevisionItem,
  Roadmap,
  Topic,
  Subtopic
};