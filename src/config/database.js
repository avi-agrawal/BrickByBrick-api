/**
 * DATABASE CONFIGURATION
 * 
 * This file configures the Sequelize ORM connection to the SQLite database.
 * SQLite is chosen for its simplicity and portability for this learning tracking application.
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite', // Using SQLite for simplicity and portability
  storage: path.join(__dirname, '../database/database.sqlite'), // Database file location
  logging: console.log, // Set to false to disable SQL query logging in production
  define: {
    timestamps: true, // Automatically adds createdAt and updatedAt to all models
    underscored: false, // Use camelCase instead of snake_case for field names
  }
});

module.exports = sequelize;