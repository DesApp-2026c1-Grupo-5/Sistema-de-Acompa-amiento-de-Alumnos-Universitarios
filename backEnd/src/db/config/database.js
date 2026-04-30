const db = require('../models');

const connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ DB conectada correctamente');
  } catch (error) {
    console.error('❌ Error conectando DB:', error);
    process.exit(1);
  }
};

module.exports = { sequelize: db.sequelize, connectDB };