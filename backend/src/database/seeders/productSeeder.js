import { Product, ProductImage, Category, ProductCategory, Inventory } from '../../models/index.js';

const seedProducts = async () => {
  try {
    console.log('🔄 Seeding products...');

    // Get categories
    const rauCuQua = await Category.findOne({ where: { slug: 'rau-cu-qua' } });
    const thitCa = await Category.findOne({ where: { slug: 'thit-ca' } });
    const doUong = await Category.findOne({ where: { slug: 'do-uong' } });
    const giaVi = await Category.findOne({ where: { slug: 'gia-vi' } });
    const haiSan = await Category.findOne({ where: { slug: 'hai-san' } });
    const nuocNgot = await Category.findOne({ where: { slug: 'nuoc-ngot' } });

    const products = [
      {
        name: 'Cà chua bi',
        slug: 'ca-chua-bi',
        description: 'Cà chua bi tươi ngon, giàu vitamin C, thích hợp cho salad và nấu ăn. Được trồng theo phương pháp hữu cơ, không sử dụng thuốc trừ sâu.',
        shortDescription: 'Cà chua bi tươi ngon, giàu vitamin C',
        price: 25000,
        comparePrice: 30000,
        sku: 'TCB001',
        status: 'active'        categories: [rauCuQua?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400',
            altText: 'Cà chua bi tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 100,
          lowStockThreshold: 10,
          trackQuantity: true
        }
      },
      {
        name: 'Thịt ba chỉ',
        slug: 'thit-ba-chi',
        description: 'Thịt ba chỉ tươi ngon từ heo VietGAP, thích hợp nướng BBQ, kho braised. Thịt có độ mềm vừa phải, vân mỡ đều.',
        shortDescription: 'Thịt ba chỉ tươi từ heo VietGAP',
        price: 120000,
        comparePrice: null,
        sku: 'TBC001',
        status: 'active'        categories: [thitCa?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
            altText: 'Thịt ba chỉ tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 50,
          lowStockThreshold: 5,
          trackQuantity: true
        }
      },
      {
        name: 'Coca Cola',
        slug: 'coca-cola',
        description: 'Nước ngọt Coca Cola 330ml, thương hiệu nổi tiếng thế giới. Hương vị độc đáo, sảng khoái.',
        shortDescription: 'Coca Cola 330ml',
        price: 12000,
        comparePrice: 15000,
        sku: 'CC330',
        status: 'active'        categories: [nuocNgot?.id || doUong?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            altText: 'Coca Cola 330ml',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 200,
          lowStockThreshold: 20,
          trackQuantity: true
        }
      },
      {
        name: 'Muối tinh',
        slug: 'muoi-tinh',
        description: 'Muối tinh khiết 500g, không chứa tạp chất. Được tinh chế từ nước biển sạch.',
        shortDescription: 'Muối tinh 500g',
        price: 8000,
        comparePrice: null,
        sku: 'MT500',
        status: 'active'        categories: [giaVi?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
            altText: 'Muối tinh 500g',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 80,
          lowStockThreshold: 10,
          trackQuantity: true
        }
      },
      {
        name: 'Cá hồi Na Uy',
        slug: 'ca-hoi-na-uy',
        description: 'Cá hồi Na Uy tươi ngon, giàu omega-3, thích hợp làm sashimi, nướng hoặc chiên. Được nhập khẩu trực tiếp.',
        shortDescription: 'Cá hồi Na Uy tươi',
        price: 350000,
        comparePrice: null,
        sku: 'CHNY001',
        status: 'active'        categories: [haiSan?.id || thitCa?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
            altText: 'Cá hồi Na Uy tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 30,
          lowStockThreshold: 5,
          trackQuantity: true
        }
      },
      {
        name: 'Rau cải xanh',
        slug: 'rau-cai-xanh',
        description: 'Rau cải xanh tươi ngon, giàu vitamin và khoáng chất. Được trồng theo tiêu chuẩn VietGAP.',
        shortDescription: 'Rau cải xanh tươi',
        price: 15000,
        comparePrice: 18000,
        sku: 'RCX001',
        status: 'active'        categories: [rauCuQua?.id].filter(Boolean),
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
            altText: 'Rau cải xanh tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ],
        inventory: {
          quantity: 150,
          lowStockThreshold: 15,
          trackQuantity: true
        }
      }
    ];

    for (const productData of products) {
      const { categories, images, inventory, ...productInfo } = productData;
      
      const [product, created] = await Product.findOrCreate({
        where: { slug: productData.slug },
        defaults: productInfo
      });

      if (created) {
        console.log(`✅ Created product: ${product.name}`);

        // Create product categories
        if (categories && categories.length > 0) {
          for (const categoryId of categories) {
            await ProductCategory.findOrCreate({
              where: { productId: product.id, categoryId: categoryId }
            });
          }
        }

        // Create product images
        if (images && images.length > 0) {
          console.log(`Creating ${images.length} images for product: ${product.name}`);
          for (const imageData of images) {
            const image = await ProductImage.create({
              ...imageData,
              productId: product.id
            });
            console.log(`✅ Created image: ${image.imageUrl}`);
          }
        } else {
          console.log(`⚠️  No images found for product: ${product.name}`);
        }

        // Create inventory
        if (inventory) {
          await Inventory.create({
            ...inventory,
            productId: product.id
          });
        }
      } else {
        console.log(`ℹ️  Product already exists: ${product.name}`);
      }
    }

    console.log('✅ Products seeding completed.');
    return true;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
};

export default seedProducts;
