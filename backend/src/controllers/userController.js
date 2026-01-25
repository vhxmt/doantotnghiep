import { User, Role } from "../models/index.js";
import { catchAsync } from "../utils/errors.js";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../utils/errors.js";
import uploadService from "../services/uploadService.js";
import { Op } from "sequelize";
import sequelize from "../database/config.js";


export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, role, search } = req.query;

  const offset = (page - 1) * limit;
  const where = {};

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Search by name or email
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const include = [
    {
      model: Role,
      as: "roles",
      through: { attributes: [] },
    },
  ];

  // Filter by role if specified
  if (role) {
    include[0].where = { name: role };
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["created_at", "DESC"]],
    distinct: true,
  });

  res.json({
    status: "success",
    data: {
      users: users.map((user) => user.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
});

/**
 * Get user by ID (Admin only)
 */
export const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.json({
    status: "success",
    data: { user: user.toJSON() },
  });
});

/**
 * Update user (Admin only)
 */
export const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, status, roleIds } = req.body;

  const user = await User.findByPk(id, {
    include: [
      {
        model: Role,
        as: "roles",
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent admin from deactivating themselves
  if (parseInt(id) === req.user.id && status === "inactive") {
    throw new ForbiddenError("You cannot deactivate your own account");
  }

  // Update basic info
  await user.update({
    firstName,
    lastName,
    phone,
    status,
  });

  // Update roles if provided
  if (roleIds && Array.isArray(roleIds)) {
    const roles = await Role.findAll({
      where: { id: roleIds },
    });
    await user.setRoles(roles);
  }

  // Reload with roles
  await user.reload({
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
    message: "User updated successfully",
    data: { user: user.toJSON() },
  });
});

/**
 * Update user status (Admin only)
 */
export const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent admin from deactivating themselves
  if (
    parseInt(id) === req.user.id &&
    (status === "inactive" || status === "banned")
  ) {
    throw new ForbiddenError("You cannot deactivate your own account");
  }

  await user.update({ status });

  res.json({
    status: "success",
    message: "User status updated successfully",
    data: { user: user.toJSON() },
  });
});

/**
 * Delete user (Admin only)
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    throw new ForbiddenError("You cannot delete your own account");
  }

  await user.destroy();

  res.json({
    status: "success",
    message: "User deleted successfully",
  });
});

/**
 * Reset user password (Admin only)
 */
export const resetUserPassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  await user.update({ password: newPassword });

  res.json({
    status: "success",
    message: "Password reset successfully",
  });
});

/**
 * Upload user avatar
 */
export const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ValidationError("Please upload an image file");
  }

  const userId = req.user.id;

  // Delete old avatar if exists
  if (req.user.avatar) {
    await uploadService.deleteFile(req.user.avatar);
  }

  // Upload new avatar
  const avatarUrl = await uploadService.uploadUserAvatar(req.file, userId);

  // Update user avatar
  await req.user.update({ avatar: avatarUrl });

  res.json({
    status: "success",
    message: "Avatar uploaded successfully",
    data: { avatarUrl },
  });
});

/**
 * Delete user avatar
 */
export const deleteAvatar = catchAsync(async (req, res) => {
  if (!req.user.avatar) {
    throw new ValidationError("No avatar to delete");
  }

  // Delete avatar file
  await uploadService.deleteFile(req.user.avatar);

  // Update user record
  await req.user.update({ avatar: null });

  res.json({
    status: "success",
    message: "Avatar deleted successfully",
  });
});

/**
 * Get user statistics (Admin only)
 */
export const getUserStats = catchAsync(async (req, res) => {
  const [totalUsers, activeUsers, inactiveUsers, bannedUsers] =
    await Promise.all([
      User.count(),
      User.count({ where: { status: "active" } }),
      User.count({ where: { status: "inactive" } }),
      User.count({ where: { status: "banned" } }),
    ]);

  // Count users by role
  const roles = await Role.findAll({
    include: [
      {
        model: User,
        as: "users",
        attributes: [],
      },
    ],
    attributes: [
      "id",
      "name",
      [sequelize.fn("COUNT", sequelize.col("users.id")), "userCount"],
    ],
    group: ["Role.id"],
    raw: true,
  });

  res.json({
    status: "success",
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      bannedUsers,
      usersByRole: roles,
    },
  });
});

/**
 * Get all roles (Admin only)
 */
export const getAllRoles = catchAsync(async (req, res) => {
  const roles = await Role.findAll({
    attributes: ['id', 'name', 'description'],
    order: [['name', 'ASC']],
  });

  res.json({
    status: "success",
    data: { roles },
  });
});
