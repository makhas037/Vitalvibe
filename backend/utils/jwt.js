// FILE: E:\CLOUD PROJECT\vitalvibe\backend\utils\jwt.js
// PURPOSE: JWT token generation and verification

const jwt = require('jsonwebtoken');
const { JWT } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

class JWTManager {
  /**
   * Generate access token
   */
  static generateAccessToken(userId) {
    return jwt.sign(
      { userId, type: 'access' },
      JWT_SECRET,
      { expiresIn: JWT.EXPIRY, algorithm: JWT.ALGORITHM }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh' },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT.REFRESH_EXPIRY, algorithm: JWT.ALGORITHM }
    );
  }

  /**
   * Generate both tokens
   */
  static generateTokens(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshAccessToken(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) return null;

    return this.generateAccessToken(decoded.userId);
  }
}

module.exports = JWTManager;
