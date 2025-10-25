/**
 * TOPIC MODEL
 * 
 * Defines the Topic model for organizing learning content within roadmaps.
 * Topics contain multiple subtopics and track completion progress.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Topic = sequelize.define('Topic', {
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
        roadmapId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roadmaps',
                key: 'id'
            }
        },
        // Progress tracking
        totalSubtopics: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        completedSubtopics: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'topics',
        timestamps: true
    });

    return Topic;
};
