import { sequelize } from '../config.js';
import { User, Role, Category, Product, ProductImage, Inventory, Order, OrderItem, Coupon } from '../../models/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Seed Roles
    const roles = await Role.bulkCreate([
      {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: ['*']
      },
      {
        name: 'staff',
        description: 'Staff member with limited access',
        permissions: ['orders:read', 'orders:update', 'products:read', 'products:update']
      },
      {
        name: 'customer',
        description: 'Regular customer',
        permissions: ['profile:read', 'profile:update', 'orders:read']
      }
    ]);
    console.log('✅ Roles seeded');

    // Seed Users
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const users = await User.bulkCreate([
      {
        email: 'admin@bachhoa.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '0123456789',
        emailVerified: true,
        status: 'active'
      },
      {
        email: 'staff@bachhoa.com',
        password: hashedPassword,
        firstName: 'Staff',
        lastName: 'Member',
        phone: '0123456788',
        emailVerified: true,
        status: 'active'
      },
      {
        email: 'customer@bachhoa.com',
        password: hashedPassword,
        firstName: 'Khách',
        lastName: 'Hàng',
        phone: '0123456787',
        emailVerified: true,
        status: 'active'
      }
    ]);

    // Assign roles to users
    await users[0].addRole(roles[0]); // Admin
    await users[1].addRole(roles[1]); // Staff
    await users[2].addRole(roles[2]); // Customer
    
    console.log('✅ Users seeded');

    // Seed Categories
    const categories = await Category.bulkCreate([
      {
        name: 'Thực phẩm tươi sống',
        slug: 'thuc-pham-tuoi-song',
        description: 'Thực phẩm tươi ngon hàng ngày',
        sortOrder: 1,
        status: 'active'
      },
      {
        name: 'Rau củ quả',
        slug: 'rau-cu-qua',
        description: 'Rau củ quả tươi ngon',
        parentId: 1,
        sortOrder: 1,
        status: 'active'
      },
      {
        name: 'Thịt cá',
        slug: 'thit-ca',
        description: 'Thịt cá tươi sống',
        parentId: 1,
        sortOrder: 2,
        status: 'active'
      },
      {
        name: 'Đồ uống',
        slug: 'do-uong',
        description: 'Các loại đồ uống',
        sortOrder: 2,
        status: 'active'
      },
      {
        name: 'Gia vị',
        slug: 'gia-vi',
        description: 'Gia vị nấu ăn',
        sortOrder: 3,
        status: 'active'
      }
    ]);
    console.log('✅ Categories seeded');

    // Seed Products
    const products = await Product.bulkCreate([
      {
        name: 'Cà chua bi',
        slug: 'ca-chua-bi',
        description: 'Cà chua bi tươi ngon, giàu vitamin C',
        shortDescription: 'Cà chua bi tươi ngon',
        sku: 'CACH-001',
        price: 25000,
        comparePrice: 30000,
        status: 'active'
      },
      {
        name: 'Thịt ba chỉ',
        slug: 'thit-ba-chi',
        description: 'Thịt ba chỉ tươi ngon, thích hợp nướng BBQ',
        shortDescription: 'Thịt ba chỉ tươi',
        sku: 'THIT-001',
        price: 120000,
        status: 'active'
      },
      {
        name: 'Coca Cola',
        slug: 'coca-cola',
        description: 'Nước ngọt Coca Cola 330ml',
        shortDescription: 'Coca Cola 330ml',
        sku: 'COCA-001',
        price: 12000,
        comparePrice: 15000,
        status: 'active'
      },
      {
        name: 'Muối tinh',
        slug: 'muoi-tinh',
        description: 'Muối tinh khiết 500g',
        shortDescription: 'Muối tinh 500g',
        sku: 'MUOI-001',
        price: 8000,
        status: 'active'
      },
      {
        name: 'Cá hồi Na Uy',
        slug: 'ca-hoi-na-uy',
        description: 'Cá hồi Na Uy tươi ngon, giàu omega-3',
        shortDescription: 'Cá hồi Na Uy tươi',
        sku: 'CAHO-001',
        price: 350000,
        status: 'active'
      }
    ]);

    // Assign products to categories
    await products[0].addCategory(categories[1]); // Cà chua bi -> Rau củ quả
    await products[1].addCategory(categories[2]); // Thịt ba chỉ -> Thịt cá
    await products[2].addCategory(categories[3]); // Coca Cola -> Đồ uống
    await products[3].addCategory(categories[4]); // Muối tinh -> Gia vị
    await products[4].addCategory(categories[2]); // Cá hồi -> Thịt cá

    console.log('✅ Products seeded');

    // Seed Inventory
    await Inventory.bulkCreate([
      { productId: 1, quantity: 100, lowStockThreshold: 10 },
      { productId: 2, quantity: 50, lowStockThreshold: 5 },
      { productId: 3, quantity: 200, lowStockThreshold: 20 },
      { productId: 4, quantity: 80, lowStockThreshold: 10 },
      { productId: 5, quantity: 30, lowStockThreshold: 5 }
    ]);
    console.log('✅ Inventory seeded');

    // Seed Coupons
    await Coupon.bulkCreate([
      {
        code: 'WELCOME10',
        name: 'Chào mừng khách hàng mới',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        type: 'percentage',
        value: 10,
        minimumOrderAmount: 100000,
        usageLimit: 100,
        usageLimitPerUser: 1,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'active'
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        description: 'Miễn phí vận chuyển cho đơn hàng từ 200k',
        type: 'fixed_amount',
        value: 30000,
        minimumOrderAmount: 200000,
        usageLimit: 50,
        usageLimitPerUser: 2,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        status: 'active'
      }
    ]);
    console.log('✅ Coupons seeded');

    // Seed Sample Order
    const sampleOrder = await Order.create({
      orderNumber: `BH${Date.now()}001`,
      userId: 3, // Customer
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'cod',
      subtotal: 157000,
      shippingAmount: 30000,
      totalAmount: 187000,
      shippingAddress: {
        recipientName: 'Khách Hàng',
        recipientPhone: '0123456787',
        addressLine1: '123 Đường ABC',
        ward: 'Phường 1',
        district: 'Quận 1',
        city: 'TP.HCM'
      },
      deliveredAt: new Date()
    });

    await OrderItem.bulkCreate([
      {
        orderId: sampleOrder.id,
        productId: 1,
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000
      },
      {
        orderId: sampleOrder.id,
        productId: 2,
        quantity: 1,
        unitPrice: 120000,
        totalPrice: 120000
      }
    ]);

    console.log('✅ Sample order seeded');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('👑 Admin: admin@bachhoa.com / 123456');
    console.log('👨‍💼 Staff: staff@bachhoa.com / 123456');
    console.log('👤 Customer: customer@bachhoa.com / 123456');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;
