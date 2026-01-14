import { User, Role } from "../models/index.js";
import JWTService from "../utils/jwt.js";
import { AppError, NotFoundError, ValidationError } from "../utils/errors.js";
import { catchAsync } from "../utils/errors.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../services/emailService.js";
import { Op } from "sequelize";

/**
 * Register a new user
 */
export const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ValidationError("Email already registered");
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    emailVerificationToken: crypto.randomBytes(32).toString("hex"),
  });

  // Assign customer role
  const customerRole = await Role.findByName("customer");
  if (customerRole) {
    await user.addRole(customerRole);
  }

  // Load user with roles
  await user.reload({
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  // Generate tokens
  const tokens = await JWTService.generateTokenPair(user);

  // Send verification email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      template: "email-verification",
      data: {
        name: user.getFullName(),
        verificationUrl,
      },
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  res.status(201).json({
    status: "success",
    message:
      "Registration successful. Please check your email to verify your account.",
    data: {
      user: user.toJSON(),
      tokens,
    },
  });
});

/**
 * Login user
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user with roles
  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  if (!user || !(await user.comparePassword(password))) {
    throw new ValidationError("Invalid email or password");
  }

  if (user.status !== "active") {
    throw new ValidationError("Account is inactive");
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  // Generate tokens
  const tokens = await JWTService.generateTokenPair(user);

  res.json({
    status: "success",
    message: "Login successful",
    data: {
      user: user.toJSON(),
      tokens,
    },
  });
});

/**
 * Refresh access token
 */
export const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError("Refresh token is required");
  }

  // Verify refresh token
  const decoded = await JWTService.verifyRefreshToken(refreshToken);

  // Find user with roles
  const user = await User.findByPk(decoded.id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  if (!user || user.status !== "active") {
    throw new NotFoundError("User not found or inactive");
  }

  // Generate new tokens
  const tokens = await JWTService.generateTokenPair(user);

  res.json({
    status: "success",
    message: "Token refreshed successfully",
    data: {
      tokens,
    },
  });
});

/**
 * Logout user
 */
export const logout = catchAsync(async (req, res) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return success
  res.json({
    status: "success",
    message: "Logout successful",
  });
});

/**
 * Forgot password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.json({
      status: "success",
      message: "Nếu email tồn tại, link khôi phục mật khẩu đã được gửi.",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.update({
    passwordResetToken: resetToken,
    passwordResetExpires: resetExpires,
  });

  // Get frontend URL from env or use default
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

  console.log(`🔑 Reset token for ${email}: ${resetToken}`);
  console.log(`🔗 Reset URL: ${resetUrl}`);

  // Check if SMTP is enabled
  const smtpEnabled = process.env.SMTP_ENABLED === 'true';

  if (smtpEnabled) {
    // Send email with reset link
    try {
      await sendEmail({
        to: user.email,
        subject: "Khôi phục mật khẩu - Bách Hóa Store",
        template: "password-reset",
        data: {
          name: user.getFullName(),
          resetUrl: resetUrl,
          expiresIn: "10 phút",
        },
      });

      return res.json({
        status: "success",
        message: "Link khôi phục mật khẩu đã được gửi đến email của bạn",
      });
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Rollback token if email fails
      await user.update({
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      throw new AppError("Không thể gửi email. Vui lòng thử lại sau.");
    }
  } else {
    // SMTP disabled: Return reset link directly (for development)
    return res.json({
      status: "success",
      message: "Link khôi phục mật khẩu (chế độ dev)",
      data: {
        resetUrl: resetUrl,
        token: resetToken,
        expiresIn: "10 phút"
      }
    });
  }
});

/**
 * Verify reset token
 */
export const verifyResetToken = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new ValidationError("Reset token is required");
  }

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new ValidationError("Invalid or expired reset token");
  }

  res.json({
    status: "success",
    message: "Token is valid",
    data: {
      email: user.email,
    },
  });
});

/**
 * Reset password
 */
export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new ValidationError("Invalid or expired reset token");
  }

  // Update password and clear reset token
  await user.update({
    password,
    passwordResetToken: null,
    passwordResetExpires: null,
  });

  res.json({
    status: "success",
    message: "Password reset successful",
  });
});

/**
 * Verify email
 */
export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({
    where: { emailVerificationToken: token },
  });

  if (!user) {
    throw new ValidationError("Invalid verification token");
  }

  await user.update({
    emailVerified: true,
    emailVerificationToken: null,
  });

  res.json({
    status: "success",
    message: "Email verified successfully",
  });
});

/**
 * Resend verification email
 */
export const resendVerification = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.emailVerified) {
    throw new ValidationError("Email is already verified");
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  await user.update({ emailVerificationToken: verificationToken });

  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    template: "email-verification",
    data: {
      name: user.getFullName(),
      verificationUrl,
    },
  });

  res.json({
    status: "success",
    message: "Verification email sent",
  });
});

/**
 * Get current user profile
 */
export const getProfile = catchAsync(async (req, res) => {
  res.json({
    status: "success",
    data: {
      user: req.user.toJSON(),
    },
  });
});

/**
 * Update user profile
 */
export const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, address, dateOfBirth, gender, avatar } = req.body;

  const updateData = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (phone !== undefined && phone !== "") updateData.phone = phone;
  if (address !== undefined && address !== "") updateData.address = address;

  // Handle avatar - allow null to remove avatar
  if (avatar !== undefined) {
    updateData.avatar = avatar;
  }

  // Handle dateOfBirth - convert empty string to null
  if (dateOfBirth !== undefined) {
    updateData.dateOfBirth = dateOfBirth === "" ? null : dateOfBirth;
  }

  // Handle gender - convert empty string to null
  if (gender !== undefined) {
    updateData.gender = gender === "" ? null : gender;
  }

  await req.user.update(updateData);

  // Reload user with roles to get updated data
  await req.user.reload({
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: req.user.toJSON(),
    },
  });
});

/**
 * Change password
 */
export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Reload user with password field (since it's excluded in auth middleware)
  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Verify current password
  if (!(await user.comparePassword(currentPassword))) {
    throw new ValidationError("Current password is incorrect");
  }

  // Update password
  await user.update({ password: newPassword });

  res.json({
    status: "success",
    message: "Password changed successfully",
  });
});
