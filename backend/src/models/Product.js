import { DataTypes } from "sequelize";
import sequelize from "../database/config.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "short_description",
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    comparePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "compare_price",
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("active", "out_of_stock", "discontinued"),
      defaultValue: "active",
    },
  },
  {
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeValidate: (product) => {
        if (product.name && !product.slug) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim("-");
        }
      },
    },
  }
);

// Instance methods
Product.prototype.isAvailable = function () {
  return this.status === "active";
};

Product.prototype.isOnSale = function () {
  return this.comparePrice && this.comparePrice > this.price;
};

Product.prototype.getDiscountPercentage = function () {
  if (!this.isOnSale()) return 0;
  return Math.round(
    ((this.comparePrice - this.price) / this.comparePrice) * 100
  );
};

Product.prototype.toJSON = function () {
  const values = { ...this.get() };
  values.isOnSale = this.isOnSale();
  values.discountPercentage = this.getDiscountPercentage();
  return values;
};

// Class methods
Product.findActive = function () {
  return this.findAll({ where: { status: "active" } });
};

Product.findBySlug = function (slug) {
  return this.findOne({ where: { slug } });
};

Product.findBySku = function (sku) {
  return this.findOne({ where: { sku } });
};

export default Product;
