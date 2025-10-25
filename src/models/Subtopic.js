/**
 * SUBTOPIC MODEL
 * 
 * Defines the Subtopic model for granular learning units within topics.
 * Each subtopic represents a specific learning objective with difficulty
 * and estimated time for completion.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Subtopic = sequelize.define('Subtopic', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        isCompleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        completedDate: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        topicId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'topics',
                key: 'id'
            }
        },
        // Simplified: No nested subtopics, only direct children of topics
        // Removed parentId and level fields for simplicity
        difficulty: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            allowNull: true,
            defaultValue: 'beginner'
        },
        estimatedTime: {
            type: DataTypes.INTEGER, // in minutes
            allowNull: true
        }
    }, {
        tableName: 'subtopics',
        timestamps: true
    });

    return Subtopic;
};
