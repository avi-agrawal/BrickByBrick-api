/**
 * DATABASE INITIALIZATION
 * 
 * This file handles database connection and table synchronization.
 * It ensures all models are properly created and relationships are established.
 */

const { sequelize } = require('../models');

async function initializeDatabase() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false }); // Set force: true to drop existing tables
    console.log('✅ All models synchronized successfully.');

  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
}

module.exports = initializeDatabase;