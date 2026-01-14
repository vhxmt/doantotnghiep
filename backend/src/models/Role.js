import { DataTypes } from 'sequelize';
import sequelize from '../database/config.js';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'roles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
Role.prototype.hasPermission = function(permission) {
  if (!this.permissions || !Array.isArray(this.permissions)) {
    return false;
  }
  
  // Check for wildcard permission
  if (this.permissions.includes('*')) {
    return true;
  }
  
  // Check for exact permission match
  if (this.permissions.includes(permission)) {
    return true;
  }
  
  // Check for pattern match (e.g., "users:*" matches "users:read")
  return this.permissions.some(perm => {
    if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -2);
      return permission.startsWith(prefix + ':');
    }
    return false;
  });
};

// Class methods
Role.findByName = function(name) {
  return this.findOne({ where: { name } });
};

export default Role;
