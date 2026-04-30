const { Sequelize } = require('sequelize');
const config = require('./config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando DB:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };