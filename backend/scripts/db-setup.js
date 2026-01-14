#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

import { initDatabase, resetDatabase } from '../src/database/init.js';
import seedDatabase from '../src/database/seeders/index.js';

const commands = {
  init: async () => {
    console.log('🚀 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialization completed!');
  },

  seed: async () => {
    console.log('🌱 Seeding database...');
    await seedDatabase();
    console.log('✅ Database seeding completed!');
  },

  reset: async () => {
    console.log('🔄 Resetting database...');
    await resetDatabase();
    console.log('✅ Database reset completed!');
  },

  setup: async () => {
    console.log('🛠️  Setting up database from scratch...');
    console.log('=====================================');
    
    // Reset database (drop and recreate tables)
    await resetDatabase();
    console.log('');
    
    // Seed with sample data
    await seedDatabase();
    
    console.log('=====================================');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('🔗 Database connection:');
    console.log(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log('');
    console.log('🔐 Demo accounts created:');
    console.log('👑 Admin: admin@bachhoa.com / 123456');
    console.log('👨‍💼 Staff: staff@bachhoa.com / 123456');
    console.log('👤 Customer: customer@bachhoa.com / 123456');
  },

  help: () => {
    console.log('📖 Database Setup Commands:');
    console.log('');
    console.log('npm run db:init    - Initialize database (create tables)');
    console.log('npm run db:seed    - Seed database with sample data');
    console.log('npm run db:reset   - Reset database (drop all tables)');
    console.log('npm run db:setup   - Complete setup (reset + seed)');
    console.log('npm run db:help    - Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  npm run db:setup  # Recommended for first time setup');
    console.log('  npm run db:seed   # Add sample data to existing database');
    console.log('  npm run db:reset  # Clean slate (removes all data)');
  }
};

const main = async () => {
  const command = process.argv[2] || 'help';
  
  if (!commands[command]) {
    console.error(`❌ Unknown command: ${command}`);
    console.log('');
    commands.help();
    process.exit(1);
  }

  try {
    await commands[command]();
    process.exit(0);
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('1. Check your database connection in .env file');
    console.error('2. Make sure MySQL server is running');
    console.error('3. Verify database credentials are correct');
    console.error('4. Ensure database "bach_hoa" exists');
    process.exit(1);
  }
};

main();
