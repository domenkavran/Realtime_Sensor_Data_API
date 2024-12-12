const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB.DATABASE, dbConfig.DB.USER, dbConfig.DB.PASSWORD, {
  host: dbConfig.DB.HOST,
  port: dbConfig.DB.PORT,
  dialect: dbConfig.DB.DIALECT,
  dialectOptions: dbConfig.DB.DIALECT_OPTIONS,
  operatorsAliases: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.data = require("./data.model")(sequelize, Sequelize);

module.exports = db;