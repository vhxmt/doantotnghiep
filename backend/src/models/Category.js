import { DataTypes } from 'sequelize';
import sequelize from '../database/config.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('image');
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
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (category) => {
      if (category.name && !category.slug) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      }
    }
  }
});

// Self-referencing association for parent-child relationship
Category.belongsTo(Category, { 
  as: 'parent', 
  foreignKey: 'parentId',
  onDelete: 'SET NULL'
});

Category.hasMany(Category, { 
  as: 'children', 
  foreignKey: 'parentId',
  onDelete: 'SET NULL'
});

// Instance methods
Category.prototype.isActive = function() {
  return this.status === 'active';
};

Category.prototype.isRootCategory = function() {
  return this.parentId === null;
};

Category.prototype.getLevel = async function() {
  let level = 0;
  let current = this;
  
  while (current.parentId) {
    level++;
    current = await Category.findByPk(current.parentId);
    if (!current) break;
  }
  
  return level;
};

Category.prototype.getPath = async function() {
  const path = [this];
  let current = this;
  
  while (current.parentId) {
    current = await Category.findByPk(current.parentId);
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }
  
  return path;
};

// Class methods
Category.findActive = function() {
  return this.findAll({ 
    where: { status: 'active' },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

Category.findRootCategories = function() {
  return this.findAll({ 
    where: { 
      parentId: null,
      status: 'active'
    },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

Category.findBySlug = function(slug) {
  return this.findOne({ where: { slug } });
};

Category.findWithChildren = function() {
  return this.findAll({
    where: { status: 'active' },
    include: [{
      model: Category,
      as: 'children',
      where: { status: 'active' },
      required: false,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    }],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

export default Category;
