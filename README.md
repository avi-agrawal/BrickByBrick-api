# Brick By Brick API

A comprehensive backend API for tracking coding problems, learning progress, and maintaining a systematic approach to skill development.

## 🏗️ Project Architecture

The project follows a modular, layered architecture with clear separation of concerns:

```
src/
├── config/                 # Configuration files
│   ├── database.js        # Database configuration
│   └── oauth.js           # OAuth configuration
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication operations
│   ├── userController.js  # User management
│   ├── problemController.js # Problem CRUD operations
│   ├── learningController.js # Learning item operations
│   ├── revisionController.js # Spaced repetition system
│   ├── roadmapController.js # Roadmap management
│   └── analyticsController.js # Analytics and insights
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   ├── validation.js     # Request validation
│   └── errorHandler.js   # Error handling
├── models/               # Database models
│   ├── index.js         # Model associations
│   ├── User.js          # User model
│   ├── Problem.js       # Problem model
│   ├── LearningItem.js  # Learning item model
│   ├── RevisionItem.js  # Revision item model
│   ├── Roadmap.js       # Roadmap model
│   ├── Topic.js         # Topic model
│   └── Subtopic.js      # Subtopic model
├── routes/               # Route definitions
│   ├── index.js         # Main route configuration
│   ├── authRoutes.js    # Authentication routes
│   ├── userRoutes.js    # User routes
│   ├── problemRoutes.js # Problem routes
│   ├── learningRoutes.js # Learning routes
│   ├── revisionRoutes.js # Revision routes
│   ├── roadmapRoutes.js # Roadmap routes
│   └── analyticsRoutes.js # Analytics routes
├── services/             # Business logic layer
│   ├── authService.js   # Authentication business logic
│   ├── problemService.js # Problem business logic
│   └── analyticsService.js # Analytics business logic
├── utils/               # Utility functions
│   ├── constants.js     # Application constants
│   └── helpers.js       # Helper functions
├── database/            # Database files
│   ├── init.js          # Database initialization
│   └── database.sqlite  # SQLite database file
└── index.js             # Application entry point
```

## 🚀 Features

### Authentication
- **Local Authentication**: Email/password registration and login
- **OAuth Integration**: Google and GitHub social login
- **JWT Tokens**: Secure token-based authentication
- **Password Security**: BCrypt hashing with salt rounds

### Problem Tracking
- **CRUD Operations**: Create, read, update, delete coding problems
- **Metadata Tracking**: Platform, difficulty, topic, time spent, outcome
- **Filtering**: Filter by difficulty, platform, outcome, topic
- **Statistics**: Success rates, time analysis, progress tracking

### Learning Management
- **Learning Items**: Track courses, tutorials, books, articles, videos
- **Progress Tracking**: Monitor completion status and progress
- **Categories**: Organize by type, category, difficulty
- **Time Tracking**: Monitor time spent on learning activities

### Spaced Repetition System
- **Scientific Intervals**: 1 day → 3 days → 7 days → 15 days → 30 days
- **Revision Scheduling**: Automatic scheduling of review sessions
- **Progress Tracking**: Monitor revision completion and cycles
- **Flexible Items**: Works with both problems and learning items

### Roadmap System
- **Hierarchical Structure**: Roadmaps → Topics → Subtopics
- **Progress Tracking**: Monitor completion at each level
- **Customization**: Personal roadmaps with colors and descriptions
- **Public Sharing**: Option to make roadmaps public

### Advanced Analytics
- **Performance Metrics**: Daily activity, weekly progress, streaks
- **Topic Analysis**: Strongest/weakest topics identification
- **Difficulty Breakdown**: Success rates by difficulty level
- **Time Analysis**: Best performing hours and productivity patterns
- **AI Insights**: Personalized recommendations and predictions

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT + Passport.js (OAuth)
- **Validation**: Express-validator
- **Security**: BCrypt, Helmet, CORS
- **Architecture**: MVC with Service Layer

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BrickByBrick-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   PORT=7007
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=7d
   SESSION_SECRET=your-session-secret
   FRONTEND_URL=http://localhost:5173
   
   # OAuth Configuration (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:7007/api/auth/google/callback
   
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=http://localhost:7007/api/auth/github/callback
   ```

4. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:userId/stats` - Get user statistics

### Problems
- `POST /api/users/:userId/problems` - Create problem
- `GET /api/users/:userId/problems` - Get user's problems
- `GET /api/problems/:id` - Get problem by ID
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem

### Learning Items
- `POST /api/users/:userId/learning-items` - Create learning item
- `GET /api/users/:userId/learning-items` - Get learning items
- `PUT /api/learning-items/:id` - Update learning item
- `DELETE /api/learning-items/:id` - Delete learning item

### Revision System
- `POST /api/users/:userId/revision-items` - Create revision item
- `GET /api/users/:userId/revision-items` - Get revision schedule
- `PUT /api/revision-items/:id/complete` - Mark revision complete

### Roadmaps
- `POST /api/users/:userId/roadmaps` - Create roadmap
- `GET /api/users/:userId/roadmaps` - Get user's roadmaps
- `GET /api/roadmaps/:roadmapId` - Get roadmap details
- `POST /api/roadmaps/:roadmapId/topics` - Create topic
- `POST /api/topics/:topicId/subtopics` - Create subtopic
- `PUT /api/topics/:id/complete` - Mark topic complete
- `PUT /api/subtopics/:id/complete` - Mark subtopic complete

### Analytics
- `GET /api/analytics` - Get comprehensive analytics

## 🏛️ Architecture Principles

### Separation of Concerns
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data structure and relationships
- **Middleware**: Handle cross-cutting concerns
- **Routes**: Define API endpoints and middleware chain

### Error Handling
- **Centralized**: Global error handler with proper logging
- **Consistent**: Standardized error response format
- **Informative**: Detailed error messages for development
- **Secure**: Sanitized error details for production

### Validation
- **Input Validation**: Request data validation with express-validator
- **Business Rules**: Service layer validation
- **Database Constraints**: Model-level validation
- **Type Safety**: Consistent data types throughout

### Security
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Input Sanitization**: Prevent injection attacks
- **CORS**: Configured for specific origins
- **Helmet**: Security headers

## 🧪 Development

### Code Organization
- **Modular Structure**: Clear separation of concerns
- **Consistent Naming**: Descriptive function and variable names
- **Documentation**: Comprehensive JSDoc comments
- **Error Handling**: Proper error propagation and logging

### Best Practices
- **Async/Await**: Modern asynchronous programming
- **Error Boundaries**: Proper error handling at each layer
- **Validation**: Input validation at multiple levels
- **Logging**: Comprehensive request and error logging
- **Testing**: Unit and integration test structure

## 📊 Database Schema

### Core Models
- **User**: Authentication and profile information
- **Problem**: Coding problems with metadata
- **LearningItem**: Learning resources and progress
- **RevisionItem**: Spaced repetition scheduling
- **Roadmap**: Learning path structure
- **Topic**: Roadmap sections
- **Subtopic**: Granular learning units

### Relationships
- User → Problems (1:many)
- User → LearningItems (1:many)
- User → RevisionItems (1:many)
- User → Roadmaps (1:many)
- Roadmap → Topics (1:many)
- Topic → Subtopics (1:many)

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database configuration
- JWT secrets
- OAuth credentials (if using social login)
- CORS origins
- Session secrets

### Database Setup
The application automatically:
- Creates database tables on startup
- Establishes model relationships
- Handles migrations

### Production Considerations
- Use environment-specific configurations
- Set up proper logging
- Configure HTTPS
- Set up monitoring and alerting
- Use production database (PostgreSQL recommended)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
