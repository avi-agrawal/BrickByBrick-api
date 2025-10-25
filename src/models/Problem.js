/**
 * PROBLEM MODEL
 * 
 * Defines the Problem model for tracking coding problems solved by users.
 * Includes metadata like platform, difficulty, topic, time spent, and outcome.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Problem = sequelize.define('Problem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['LeetCode', 'HackerRank', 'Codeforces', 'AtCoder', 'CodeChef', 'other']]
      }
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['easy', 'medium', 'hard']]
      }
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 1440 // Max 24 hours in minutes
      }
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['solved', 'attempted', 'stuck', 'skipped', 'hints', 'failed']]
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    link: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    isRevision: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    codeLink: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
  }, {
    tableName: 'problems',
    timestamps: true
  });

  return Problem;
};