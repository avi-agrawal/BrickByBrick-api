/**
 * OAUTH AUTHENTICATION CONFIGURATION
 * 
 * This file configures Passport.js for OAuth authentication with Google and GitHub.
 * It handles user creation, account linking, and session management for social login.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');

// Configure Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:7007/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({
      where: {
        providerId: profile.id,
        authProvider: 'google'
      }
    });

    if (user) {
      // Update last login and refresh token for existing user
      await user.update({
        lastLoginAt: new Date(),
        refreshToken: refreshToken
      });
      return done(null, user);
    }

    // Check if user exists with same email but different provider (account linking)
    const existingUser = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (existingUser) {
      // Link the OAuth account to existing user account
      await existingUser.update({
        authProvider: 'google',
        providerId: profile.id,
        profilePicture: profile.photos[0]?.value,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        refreshToken: refreshToken
      });
      return done(null, existingUser);
    }

    // Create new user account from Google profile
    const newUser = await User.create({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      authProvider: 'google',
      providerId: profile.id,
      profilePicture: profile.photos[0]?.value,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      refreshToken: refreshToken
    });

    return done(null, newUser);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
  }));
}

// Configure GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:7007/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this GitHub ID
    let user = await User.findOne({
      where: {
        providerId: profile.id,
        authProvider: 'github'
      }
    });

    if (user) {
      // Update last login and refresh token
      await user.update({
        lastLoginAt: new Date(),
        refreshToken: refreshToken
      });
      return done(null, user);
    }

    // Check if user exists with same email but different provider
    const existingUser = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (existingUser) {
      // Link the OAuth account to existing user
      await existingUser.update({
        authProvider: 'github',
        providerId: profile.id,
        profilePicture: profile.photos[0]?.value,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        refreshToken: refreshToken
      });
      return done(null, existingUser);
    }

    // Create new user
    const newUser = await User.create({
      firstName: profile.displayName.split(' ')[0] || profile.username,
      lastName: profile.displayName.split(' ').slice(1).join(' ') || '',
      email: profile.emails[0].value,
      authProvider: 'github',
      providerId: profile.id,
      profilePicture: profile.photos[0]?.value,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      refreshToken: refreshToken
    });

    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
  }));
}

// Serialize user for session storage
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session storage
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
