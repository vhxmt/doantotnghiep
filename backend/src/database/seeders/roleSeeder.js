import { Role } from '../../models/index.js';

const seedRoles = async () => {
  try {
    console.log('🔄 Seeding roles...');

    const roles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access and management capabilities'
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Store management and inventory oversight'
      },
      {
        name: 'staff',
        displayName: 'Staff',
        description: 'Basic store operations and customer service'
      },
      {
        name: 'customer',
        displayName: 'Customer',
        description: 'Regular customer with shopping privileges'
      }
    ];

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      if (created) {
        console.log(`✅ Created role: ${role.displayName}`);
      } else {
        console.log(`ℹ️  Role already exists: ${role.displayName}`);
      }
    }

    console.log('✅ Roles seeding completed.');
    return true;
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

export default seedRoles;
