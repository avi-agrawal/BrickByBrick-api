/**
 * AUTHENTICATION SERVICE
 * 
 * Business logic for authentication operations including
 * user registration, login, token management, and OAuth handling.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

/**
 * Generate JWT token for user authentication
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      authProvider: user.authProvider 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and token
 */
const registerUser = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      token
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to register user', 500);
  }
};

/**
 * Authenticate user login
 * @param {Object} loginData - Login credentials
 * @returns {Object} User data and token
 */
const loginUser = async (loginData) => {
  try {
    const { email, password } = loginData;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      throw new AppError('Please use social login for this account', 400);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      },
      token
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Login failed', 500);
  }
};

/**
 * Verify JWT token and get user
 * @param {string} token - JWT token
 * @returns {Object} User data
 */
const verifyToken = async (token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token has expired', 401);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Token verification failed', 500);
  }
};

/**
 * Handle OAuth user creation or login
 * @param {Object} profile - OAuth profile data
 * @param {string} provider - OAuth provider
 * @returns {Object} User data and token
 */
const handleOAuthUser = async (profile, provider) => {
  try {
    const email = profile.emails[0].value;
    
    // Check if user exists with this provider
    let user = await User.findOne({
      where: {
        providerId: profile.id,
        authProvider: provider
      }
    });

    if (user) {
      // Update last login
      await user.update({ lastLoginAt: new Date() });
    } else {
      // Check if user exists with same email but different provider
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        // Link OAuth account to existing user
        await existingUser.update({
          authProvider: provider,
          providerId: profile.id,
          profilePicture: profile.photos[0]?.value,
          isEmailVerified: true,
          lastLoginAt: new Date()
        });
        user = existingUser;
      } else {
        // Create new user
        const nameParts = provider === 'google' 
          ? { firstName: profile.name.givenName, lastName: profile.name.familyName }
          : { 
              firstName: profile.displayName.split(' ')[0] || profile.username,
              lastName: profile.displayName.split(' ').slice(1).join(' ') || ''
            };

        user = await User.create({
          ...nameParts,
          email,
          authProvider: provider,
          providerId: profile.id,
          profilePicture: profile.photos[0]?.value,
          isEmailVerified: true,
          lastLoginAt: new Date()
        });
      }
    }

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authProvider: user.authProvider,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt
      },
      token
    };
  } catch (error) {
    throw new AppError('OAuth authentication failed', 500);
  }
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  verifyToken,
  handleOAuthUser
};
