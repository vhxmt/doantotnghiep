import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

class JWTService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} Access token
   */
  async generateAccessToken(payload) {
    return await signAsync(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'bach-hoa-api',
      audience: 'bach-hoa-client'
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {Promise<string>} Refresh token
   */
  async generateRefreshToken(payload) {
    return await signAsync(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'bach-hoa-api',
      audience: 'bach-hoa-client'
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Promise<Object>} Token pair
   */
  async generateTokenPair(user) {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles?.map(role => role.name) || []
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken({ id: user.id })
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Promise<Object>} Decoded payload
   */
  async verifyAccessToken(token) {
    try {
      return await verifyAsync(token, this.accessTokenSecret, {
        issuer: 'bach-hoa-api',
        audience: 'bach-hoa-client'
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {Promise<Object>} Decoded payload
   */
  async verifyRefreshToken(token) {
    try {
      return await verifyAsync(token, this.refreshTokenSecret, {
        issuer: 'bach-hoa-api',
        audience: 'bach-hoa-client'
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }
}

export default new JWTService();
