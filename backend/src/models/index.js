import sequelize from "../database/config.js";
import User from "./User.js";
import Role from "./Role.js";
import Product from "./Product.js";
import Category from "./Category.js";
import Order from "./Order.js";
import Coupon from "./Coupon.js";
import Review from "./Review.js";

// Import other models
import { DataTypes } from "sequelize";

// UserRole junction table
const UserRole = sequelize.define(
  "UserRole",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "role_id",
    },
  },
  {
    tableName: "user_roles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Address model
const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    type: {
      type: DataTypes.ENUM("home", "work", "other"),
      defaultValue: "home",
    },
    recipientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "recipient_name",
    },
    recipientPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: "recipient_phone",
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "address_line_1",
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "address_line_2",
    },
    ward: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "postal_code",
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_default",
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// ProductImage model
const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_id",
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: "image_url",
      get() {
        const rawValue = this.getDataValue("imageUrl");
        if (!rawValue) return null;
        // If already a full URL, return as is
        if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
          return rawValue;
        }
        // Convert relative path to full URL
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        return `${baseUrl}${rawValue}`;
      },
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "thumbnail_url",
      get() {
        const rawValue = this.getDataValue("thumbnailUrl");
        if (!rawValue) return null;
        // If already a full URL, return as is
        if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
          return rawValue;
        }
        // Convert relative path to full URL
        const baseUrl = process.env.BASE_URL || "http://localhost:5000";
        return `${baseUrl}${rawValue}`;
      },
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "alt_text",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "sort_order",
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_primary",
    },
  },
  {
    tableName: "product_images",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// ProductCategory junction table
const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "category_id",
    },
  },
  {
    tableName: "product_categories",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Inventory model
const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "reserved_quantity",
      validate: {
        min: 0,
      },
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: "low_stock_threshold",
      validate: {
        min: 0,
      },
    },
    trackQuantity: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "track_quantity",
    },
  },
  {
    tableName: "inventory",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// OrderItem model
const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "order_id",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "unit_price",
      validate: {
        min: 0,
      },
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "total_price",
      validate: {
        min: 0,
      },
    },
    productSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "product_snapshot",
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Define associations
// User associations
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: "userId",
  otherKey: "roleId",
  as: "roles",
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: "roleId",
  otherKey: "userId",
  as: "users",
});

User.hasMany(Address, {
  foreignKey: "userId",
  as: "addresses",
  onDelete: "CASCADE",
});

Address.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Order, {
  foreignKey: "userId",
  as: "orders",
  onDelete: "CASCADE",
});

Order.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Product associations
Product.hasMany(ProductImage, {
  foreignKey: "productId",
  as: "images",
  onDelete: "CASCADE",
});

ProductImage.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: "productId",
  otherKey: "categoryId",
  as: "categories",
  onDelete: "CASCADE",
});

Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: "categoryId",
  otherKey: "productId",
  as: "products",
});

Product.hasOne(Inventory, {
  foreignKey: "productId",
  as: "inventory",
  onDelete: "CASCADE",
});

Inventory.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

// Order associations
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

OrderItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Product.hasMany(OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
  onDelete: "CASCADE",
});

// Review associations
Review.belongsTo(Product, {
  foreignKey: "productId",
  as: "product",
});

Review.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Review.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order",
});

Product.hasMany(Review, {
  foreignKey: "productId",
  as: "reviews",
  onDelete: "CASCADE",
});

User.hasMany(Review, {
  foreignKey: "userId",
  as: "reviews",
});

// Export all models
export {
  sequelize,
  User,
  Role,
  UserRole,
  Address,
  Product,
  ProductImage,
  Category,
  ProductCategory,
  Inventory,
  Order,
  OrderItem,
  Coupon,
  Review,
};

export default {
  sequelize,
  User,
  Role,
  UserRole,
  Address,
  Product,
  ProductImage,
  Category,
  ProductCategory,
  Inventory,
  Order,
  OrderItem,
  Coupon,
  Review,
};
