/**
 * REVISION ITEM MODEL
 * 
 * Defines the RevisionItem model for implementing spaced repetition system.
 * Tracks when items (problems or learning items) should be reviewed again
 * using scientifically-backed intervals for optimal retention.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RevisionItem = sequelize.define('RevisionItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        itemType: {
            type: DataTypes.ENUM('problem', 'learning'),
            allowNull: false
        },
        originalDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        nextRevisionDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        revisionCycle: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
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
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'revision_items',
        timestamps: true
    });

    return RevisionItem;
};
