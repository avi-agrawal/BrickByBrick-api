/**
 * ROADMAP MODEL
 * 
 * Defines the Roadmap model for creating structured learning paths.
 * Users can create custom roadmaps with topics and subtopics to track
 * their learning journey systematically.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Roadmap = sequelize.define('Roadmap', {
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
        color: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '#3B82F6' // Default blue color
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        lastVisited: {
            type: DataTypes.DATE,
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
        tableName: 'roadmaps',
        timestamps: true
    });

    return Roadmap;
};
