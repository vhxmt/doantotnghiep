import { Category } from '../../models/index.js';

const seedCategories = async () => {
  try {
    console.log('🔄 Seeding categories...');

    const categories = [
      {
        name: 'Thực phẩm tươi sống',
        slug: 'thuc-pham-tuoi-song',
        description: 'Các sản phẩm thực phẩm tươi sống như rau củ, thịt cá, hải sản',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
        status: 'active',
        sortOrder: 1,
        children: [
          {
            name: 'Rau củ quả',
            slug: 'rau-cu-qua',
            description: 'Rau củ quả tươi ngon, sạch, an toàn',
            imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
            status: 'active',
            sortOrder: 1
          },
          {
            name: 'Thịt cá',
            slug: 'thit-ca',
            description: 'Thịt tươi, cá tươi chất lượng cao',
            imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
            status: 'active',
            sortOrder: 2
          },
          {
            name: 'Hải sản',
            slug: 'hai-san',
            description: 'Hải sản tươi sống từ biển',
            imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
            status: 'active',
            sortOrder: 3
          }
        ]
      },
      {
        name: 'Đồ uống',
        slug: 'do-uong',
        description: 'Các loại đồ uống từ nước ngọt đến đồ uống có cồn',
        imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        status: 'active',
        sortOrder: 2,
        children: [
          {
            name: 'Nước ngọt',
            slug: 'nuoc-ngot',
            description: 'Các loại nước ngọt có gas và không gas',
            imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            status: 'active',
            sortOrder: 1
          },
          {
            name: 'Nước trái cây',
            slug: 'nuoc-trai-cay',
            description: 'Nước ép trái cây tự nhiên',
            imageUrl: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
            status: 'active',
            sortOrder: 2
          }
        ]
      },
      {
        name: 'Gia vị',
        slug: 'gia-vi',
        description: 'Các loại gia vị, ướp nướng, nước chấm',
        imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        status: 'active',
        sortOrder: 3
      },
      {
        name: 'Bánh kẹo',
        slug: 'banh-keo',
        description: 'Bánh kẹo, snack, đồ ăn vặt',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        status: 'active',
        sortOrder: 4
      },
      {
        name: 'Sữa và sản phẩm từ sữa',
        slug: 'sua-va-san-pham-tu-sua',
        description: 'Sữa tươi, sữa chua, phô mai, bơ',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        status: 'active',
        sortOrder: 5
      },
      {
        name: 'Đồ gia dụng',
        slug: 'do-gia-dung',
        description: 'Các sản phẩm gia dụng thiết yếu',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        status: 'active',
        sortOrder: 6
      }
    ];

    for (const categoryData of categories) {
      const { children, ...parentData } = categoryData;
      
      const [parentCategory, created] = await Category.findOrCreate({
        where: { slug: parentData.slug },
        defaults: parentData
      });

      if (created) {
        console.log(`✅ Created category: ${parentCategory.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${parentCategory.name}`);
      }

      // Create child categories if they exist
      if (children && children.length > 0) {
        for (const childData of children) {
          const [childCategory, childCreated] = await Category.findOrCreate({
            where: { slug: childData.slug },
            defaults: {
              ...childData,
              parentId: parentCategory.id
            }
          });

          if (childCreated) {
            console.log(`✅ Created subcategory: ${childCategory.name}`);
          } else {
            console.log(`ℹ️  Subcategory already exists: ${childCategory.name}`);
          }
        }
      }
    }

    console.log('✅ Categories seeding completed.');
    return true;
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

export default seedCategories;
