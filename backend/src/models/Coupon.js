import { DataTypes } from "sequelize";
import sequelize from "../database/config.js";

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("percentage", "fixed_amount", "free_shipping"),
      allowNull: false,
      defaultValue: "percentage",
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    minimumOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: "minimum_order_amount",
      validate: {
        min: 0,
      },
    },
    maximumDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "maximum_discount_amount",
      validate: {
        min: 0,
      },
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "usage_limit",
      validate: {
        min: 0,
      },
    },
    usageLimitPerUser: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      field: "usage_limit_per_user",
      validate: {
        min: 0,
      },
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "used_count",
      validate: {
        min: 0,
      },
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "starts_at",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "expires_at",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "expired"),
      allowNull: false,
      defaultValue: "active",
    },
    isFirstTimeOnly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_first_time_only",
    },
  },
  {
    tableName: "coupons",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["code"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["expires_at"],
      },
      {
        fields: ["starts_at"],
      },
    ],
  }
);

// Instance methods
Coupon.prototype.isValid = function () {
  const now = new Date();

  // Check status
  if (this.status !== "active") {
    return { valid: false, reason: "Coupon is not active" };
  }

  // Check start date
  if (this.startsAt && now < this.startsAt) {
    return { valid: false, reason: "Coupon has not started yet" };
  }

  // Check expiry date
  if (this.expiresAt && now > this.expiresAt) {
    return { valid: false, reason: "Coupon has expired" };
  }

  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }

  return { valid: true };
};

Coupon.prototype.calculateDiscount = function (orderAmount, shippingAmount = 0) {
  // Check minimum order amount
  if (this.minimumOrderAmount && orderAmount < this.minimumOrderAmount) {
    return {
      discount: 0,
      shippingDiscount: 0,
      reason: `Minimum order amount is ${this.minimumOrderAmount}`,
    };
  }

  let discount = 0;
  let shippingDiscount = 0;

  if (this.type === "percentage") {
    discount = (orderAmount * this.value) / 100;

    // Apply maximum discount limit if set
    if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
      discount = this.maximumDiscountAmount;
    }
  } else if (this.type === "fixed_amount") {
    discount = this.value;
  } else if (this.type === "free_shipping") {
    // Free shipping discount
    shippingDiscount = shippingAmount;
  }

  // Ensure discount doesn't exceed order amount
  discount = Math.min(discount, orderAmount);

  return { discount, shippingDiscount, reason: null };
};

// Static methods
Coupon.findValidCoupon = async function (code) {
  const coupon = await this.findOne({ where: { code: code.toUpperCase() } });

  if (!coupon) {
    return { coupon: null, error: "Coupon not found" };
  }

  const validation = coupon.isValid();
  if (!validation.valid) {
    return { coupon: null, error: validation.reason };
  }

  return { coupon, error: null };
};

export default Coupon;
