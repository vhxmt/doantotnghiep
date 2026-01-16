import { DataTypes } from "sequelize";
import sequelize from "../database/config.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "order_number",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "packing",
        "shipping",
        "delivered",
        "cancelled",
        "returned"
      ),
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("unpaid", "paid", "refunded", "failed"),
      defaultValue: "unpaid",
      field: "payment_status",
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod", "vnpay", "stripe", "zalopay"),
      defaultValue: "cod",
      field: "payment_method",
    },
    paymentTransactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "payment_transaction_id",
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "paid_at",
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "tax_amount",
      validate: {
        min: 0,
      },
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "shipping_amount",
      validate: {
        min: 0,
      },
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: "discount_amount",
      validate: {
        min: 0,
      },
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_amount",
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "VND",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.JSON,
      allowNull: false,
      field: "shipping_address",
    },
    billingAddress: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "billing_address",
    },
    shippedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "shipped_at",
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "delivered_at",
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "cancelled_at",
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cancellation_reason",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: (order) => {
        if (!order.orderNumber) {
          const timestamp = Date.now().toString();
          const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
          order.orderNumber = `ML${timestamp}${random}`;
        }
      },
    },
  }
);

// Instance methods
Order.prototype.isPending = function () {
  return this.status === "pending";
};

Order.prototype.isConfirmed = function () {
  return this.status === "confirmed";
};

Order.prototype.isShipping = function () {
  return this.status === "shipping";
};

Order.prototype.isDelivered = function () {
  return this.status === "delivered";
};

Order.prototype.isCancelled = function () {
  return this.status === "cancelled";
};

Order.prototype.canBeCancelled = function () {
  return ["pending", "confirmed"].includes(this.status);
};

Order.prototype.canBeReturned = function () {
  return this.status === "delivered" && this.deliveredAt;
};

Order.prototype.isPaid = function () {
  return this.paymentStatus === "paid";
};

Order.prototype.getStatusColor = function () {
  const colors = {
    pending: "warning",
    confirmed: "info",
    packing: "info",
    shipping: "primary",
    delivered: "success",
    cancelled: "error",
    returned: "error",
  };
  return colors[this.status] || "default";
};

Order.prototype.getPaymentStatusColor = function () {
  const colors = {
    unpaid: "warning",
    paid: "success",
    refunded: "info",
    failed: "error",
  };
  return colors[this.paymentStatus] || "default";
};

// Class methods
Order.findByOrderNumber = function (orderNumber) {
  return this.findOne({ where: { orderNumber } });
};

Order.findByUser = function (userId) {
  return this.findAll({
    where: { userId },
    order: [["created_at", "DESC"]],
  });
};

Order.findByStatus = function (status) {
  return this.findAll({
    where: { status },
    order: [["created_at", "DESC"]],
  });
};

export default Order;
