import sequelize from './config.js';
import models from '../models/index.js';

const initDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    console.log('🔄 Synchronizing database models...');
    
    // Sync all models
    await sequelize.sync({ 
      force: false, // Set to true to drop and recreate tables
      alter: true   // Update existing tables to match models
    });
    
    console.log('✅ Database models synchronized successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const dropDatabase = async () => {
  try {
    console.log('🔄 Dropping all tables...');
    
    await sequelize.drop();
    console.log('✅ All tables dropped successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables
    await dropDatabase();
    
    // Recreate all tables
    await sequelize.sync({ force: true });
    
    console.log('✅ Database reset successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

export { initDatabase, dropDatabase, resetDatabase };
export default initDatabase;
