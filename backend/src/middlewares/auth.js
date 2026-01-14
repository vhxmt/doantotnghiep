import JWTService from "../utils/jwt.js";
import { User, Role } from "../models/index.js";
import { AppError } from "../utils/errors.js";

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      return next(new AppError("Access token is required", 401));
    }

    // Verify token
    const decoded = await JWTService.verifyAccessToken(token);

    // Find user with roles
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.status !== "active") {
      return next(new AppError("Account is inactive", 401));
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.message === "Invalid access token") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = await JWTService.verifyAccessToken(token);
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
          },
        ],
        attributes: { exclude: ["password"] },
      });

      if (user && user.status === "active") {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Allowed role names
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const userRoles = req.user.roles?.map((role) => role.name) || [];

    // Debug logging với detail hơn
    console.log("🔐 Authorization check:");
    console.log("  User ID:", req.user.id);
    console.log("  User Email:", req.user.email);
    console.log("  User Roles (raw):", req.user.roles);
    console.log("  User Roles (mapped):", userRoles);
    console.log("  User Roles (JSON):", JSON.stringify(userRoles));
    console.log("  Allowed Roles:", allowedRoles);
    console.log("  Allowed Roles (JSON):", JSON.stringify(allowedRoles));

    // Trim và lowercase để so sánh
    const normalizedUserRoles = userRoles.map((r) =>
      String(r).trim().toLowerCase()
    );
    const normalizedAllowedRoles = allowedRoles.map((r) =>
      String(r).trim().toLowerCase()
    );

    console.log("  Normalized User Roles:", normalizedUserRoles);
    console.log("  Normalized Allowed Roles:", normalizedAllowedRoles);

    // Check if user has any of the allowed roles
    const hasPermission = normalizedAllowedRoles.some((role) =>
      normalizedUserRoles.includes(role)
    );

    console.log("  Has Permission:", hasPermission);

    if (!hasPermission) {
      return next(
        new AppError(
          `Insufficient permissions. Required: ${allowedRoles.join(
            ", "
          )}. User has: ${userRoles.join(", ") || "none"}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * @param {string} permission - Required permission
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const userRoles = req.user.roles || [];

    // Check if any user role has the required permission
    const hasPermission = userRoles.some((role) =>
      role.hasPermission(permission)
    );

    if (!hasPermission) {
      return next(new AppError(`Permission '${permission}' required`, 403));
    }

    next();
  };
};

/**
 * Owner or admin authorization middleware
 * Allows access if user is the owner of the resource or has admin role
 * @param {string} resourceUserIdField - Field name containing the user ID (default: 'userId')
 */
export const authorizeOwnerOrAdmin = (resourceUserIdField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    const userRoles = req.user.roles?.map((role) => role.name) || [];
    const isAdmin = userRoles.includes("admin");

    // Admin can access everything
    if (isAdmin) {
      return next();
    }

    // Check if user is the owner
    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = resourceUserId && parseInt(resourceUserId) === req.user.id;

    if (!isOwner) {
      return next(new AppError("Access denied", 403));
    }

    next();
  };
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (req, res, next) => {
  // This would typically use a rate limiting library like express-rate-limit
  // For now, we'll just pass through
  next();
};

/**
 * Middleware to check if user email is verified
 */
export const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }

  if (!req.user.emailVerified) {
    return next(new AppError("Email verification required", 403));
  }

  next();
};

/**
 * Middleware to refresh token if it's about to expire
 */
export const refreshTokenIfNeeded = async (req, res, next) => {
  if (!req.token || !req.user) {
    return next();
  }

  try {
    // Check if token expires within 5 minutes
    const expiration = JWTService.getTokenExpiration(req.token);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiration && expiration < fiveMinutesFromNow) {
      // Generate new token pair
      const tokens = await JWTService.generateTokenPair(req.user);

      // Add new tokens to response headers
      res.set("X-New-Access-Token", tokens.accessToken);
      res.set("X-New-Refresh-Token", tokens.refreshToken);
    }

    next();
  } catch (error) {
    // Don't fail the request if token refresh fails
    next();
  }
};
