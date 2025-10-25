/**
 * BRICK BY BRICK API SERVER
 * 
 * A comprehensive backend API for tracking coding problems, learning progress, 
 * and maintaining a systematic approach to skill development.
 * 
 * Main Features:
 * - User authentication (Email/Password + OAuth)
 * - Coding problem tracking with statistics
 * - Learning item management
 * - Spaced repetition system for revision
 * - Roadmap creation and progress tracking
 * - Advanced analytics and insights
 * 
 * Tech Stack:
 * - Express.js (Web framework)
 * - Sequelize ORM (Database management)
 * - SQLite (Database)
 * - Passport.js (OAuth authentication)
 * - JWT (Token-based authentication)
 * - BCrypt (Password hashing)
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('./config/oauth');
const initializeDatabase = require('./database/init');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 7007;

// ========== MIDDLEWARE CONFIGURATION ==========

// CORS configuration - allows frontend to make requests from different origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // Allow cookies to be sent
}));

// Session configuration for OAuth authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours session duration
  }
}));

// Initialize Passport for OAuth (Google, GitHub)
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware - parses incoming JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from dist folder (frontend build)
const staticPath = path.join(__dirname, '../../dist');
app.use(express.static(staticPath));

// ========== ROUTES ==========

// Mount all routes
app.use('/', routes);

// ========== ERROR HANDLING ==========

// 404 handler for non-API routes
app.use('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      error: 'API route not found' 
    });
  }

  // Serve frontend for all other routes (SPA fallback)
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Global error handler
app.use(errorHandler);

// ========== SERVER INITIALIZATION ==========

/**
 * Start the server and initialize database connection
 */
async function startServer() {
  try {
    // Initialize database connection and sync models
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Brick By Brick API running on port ${PORT}`);
      console.log(`📊 Database: SQLite3`);
      console.log(`📁 Database file: ./database/database.sqlite`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer().catch(console.error);