#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

import { Product, ProductImage } from '../src/models/index.js';

const addProductImages = async () => {
  try {
    console.log('🖼️  Adding images to existing products...');

    const productImages = [
      {
        slug: 'ca-chua-bi',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?w=400',
            altText: 'Cà chua bi tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      {
        slug: 'thit-ba-chi',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
            altText: 'Thịt ba chỉ tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      {
        slug: 'coca-cola',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
            altText: 'Coca Cola 330ml',
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      {
        slug: 'muoi-tinh',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
            altText: 'Muối tinh 500g',
            isPrimary: true,
            sortOrder: 1
          }
        ]
      },
      {
        slug: 'ca-hoi-na-uy',
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
            altText: 'Cá hồi Na Uy tươi',
            isPrimary: true,
            sortOrder: 1
          }
        ]
      }
    ];

    for (const productData of productImages) {
      const product = await Product.findOne({ where: { slug: productData.slug } });
      
      if (!product) {
        console.log(`⚠️  Product not found: ${productData.slug}`);
        continue;
      }

      // Check if images already exist
      const existingImages = await ProductImage.findAll({ where: { productId: product.id } });
      
      if (existingImages.length > 0) {
        console.log(`ℹ️  Images already exist for: ${product.name}`);
        continue;
      }

      // Create images
      for (const imageData of productData.images) {
        const image = await ProductImage.create({
          ...imageData,
          productId: product.id
        });
        console.log(`✅ Added image to ${product.name}: ${image.imageUrl}`);
      }
    }

    console.log('🎉 Product images added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add product images:', error);
    process.exit(1);
  }
};

addProductImages();
