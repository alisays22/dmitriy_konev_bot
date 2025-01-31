require("dotenv").config();
const { Sequelize } = require('sequelize');

const db = new Sequelize(
  process.env.POSTGRES_DATABASE,
  process.env.POSTGRES_USERNAME,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    // port: 5432,
    // define: {
    //   timestamps: false
    // }, //время записи
  }
);




module.exports = db;





