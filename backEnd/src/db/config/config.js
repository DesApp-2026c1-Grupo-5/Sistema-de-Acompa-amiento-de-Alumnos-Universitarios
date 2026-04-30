require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  logging: false,
};

module.exports = {
  development: {
    ...baseConfig,
    database: process.env.DB_NAME,
  },
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME,
  },
  production: {
    ...baseConfig,
    datebase: process.env.DB_PROD_NAME,
  }

};