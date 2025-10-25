/**
 * LEARNING ITEM MODEL
 * 
 * Defines the LearningItem model for tracking learning resources like courses,
 * tutorials, books, articles, and videos. Includes progress tracking and metadata.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LearningItem = sequelize.define('LearningItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('course', 'book', 'tutorial', 'article', 'video', 'podcast', 'workshop', 'other'),
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        subtopic: {
            type: DataTypes.STRING,
            allowNull: true
        },
        timeSpent: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        progress: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        status: {
            type: DataTypes.ENUM('not-started', 'in-progress', 'completed', 'paused'),
            allowNull: false,
            defaultValue: 'not-started'
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        tags: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resourceLink: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isRevision: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        difficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            allowNull: true
        },
        platform: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'learning_items',
        timestamps: true
    });

    return LearningItem;
};
