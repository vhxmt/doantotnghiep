import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../database/config.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "last_name",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-()]+$/,
      },
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('avatar');
        if (!rawValue) return null;
        // If already a full URL, return as is
        if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
          return rawValue;
        }
        // Convert relative path to full URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        return `${baseUrl}${rawValue}`;
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "date_of_birth",
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "email_verified",
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "email_verification_token",
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "password_reset_token",
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "password_reset_expires",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_login",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.passwordResetToken;
  delete values.emailVerificationToken;
  return values;
};

// Class methods
User.findByEmail = function (email) {
  return this.findOne({ where: { email } });
};

User.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

export default User;
