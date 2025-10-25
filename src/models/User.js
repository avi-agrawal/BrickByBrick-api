/**
 * USER MODEL
 * 
 * Defines the User model for authentication and user management.
 * Supports both local (email/password) and OAuth authentication.
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth users (Google, GitHub)
      validate: {
        notEmpty: function(value) {
          if (this.authProvider === 'local' && !value) {
            throw new Error('Password is required for local authentication');
          }
        },
        len: {
          args: [6, 100],
          msg: 'Password must be between 6 and 100 characters'
        }
      }
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google', 'github'),
      allowNull: false,
      defaultValue: 'local'
    },
    providerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'OAuth provider user ID (Google ID, GitHub ID, etc.)'
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to user profile picture'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'OAuth refresh token for token renewal'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['providerId', 'authProvider'],
        where: {
          providerId: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
    ]
  });

  return User;
};