// server/config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Set to true if you want to see SQL logs
  dialectOptions: {
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
});

module.exports = sequelize;