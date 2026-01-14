import bcrypt from 'bcryptjs';
import { User, Role, UserRole, Address } from '../../models/index.js';

const seedUsers = async () => {
  try {
    console.log('🔄 Seeding users...');

    // Get roles
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const managerRole = await Role.findOne({ where: { name: 'manager' } });
    const customerRole = await Role.findOne({ where: { name: 'customer' } });

    if (!adminRole || !managerRole || !customerRole) {
      throw new Error('Required roles not found. Please seed roles first.');
    }

    const users = [
      {
        email: 'admin@bachhoa.com',
        password: await bcrypt.hash('Admin123!', 12),
        firstName: 'Admin',
        lastName: 'System',
        phone: '0123456789',
        emailVerified: true,
        status: 'active',
        roles: [adminRole.id]
      },
      {
        email: 'manager@bachhoa.com',
        password: await bcrypt.hash('Manager123!', 12),
        firstName: 'Quản lý',
        lastName: 'Cửa hàng',
        phone: '0123456788',
        emailVerified: true,
        status: 'active',
        roles: [managerRole.id]
      },
      {
        email: 'customer@bachhoa.com',
        password: await bcrypt.hash('Customer123!', 12),
        firstName: 'Khách hàng',
        lastName: 'Mẫu',
        phone: '0123456787',
        emailVerified: true,
        status: 'active',
        roles: [customerRole.id],
        addresses: [
          {
            type: 'home',
            recipientName: 'Khách hàng Mẫu',
            recipientPhone: '0123456787',
            addressLine1: '123 Đường ABC',
            ward: 'Phường 1',
            district: 'Quận 1',
            city: 'TP.HCM',
            isDefault: true
          }
        ]
      },
      {
        email: 'john.doe@example.com',
        password: await bcrypt.hash('Password123!', 12),
        firstName: 'John',
        lastName: 'Doe',
        phone: '0987654321',
        emailVerified: true,
        status: 'active',
        roles: [customerRole.id],
        addresses: [
          {
            type: 'home',
            recipientName: 'John Doe',
            recipientPhone: '0987654321',
            addressLine1: '456 Đường XYZ',
            ward: 'Phường 2',
            district: 'Quận 3',
            city: 'TP.HCM',
            isDefault: true
          }
        ]
      }
    ];

    for (const userData of users) {
      const { roles, addresses, ...userInfo } = userData;
      
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userInfo
      });

      if (created) {
        console.log(`✅ Created user: ${user.email}`);

        // Assign roles
        if (roles && roles.length > 0) {
          for (const roleId of roles) {
            await UserRole.findOrCreate({
              where: { userId: user.id, roleId: roleId }
            });
          }
        }

        // Create addresses
        if (addresses && addresses.length > 0) {
          for (const addressData of addresses) {
            await Address.create({
              ...addressData,
              userId: user.id
            });
          }
        }
      } else {
        console.log(`ℹ️  User already exists: ${user.email}`);
      }
    }

    console.log('✅ Users seeding completed.');
    return true;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

export default seedUsers;
