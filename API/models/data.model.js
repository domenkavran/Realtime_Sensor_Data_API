const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db.config'); // You need to configure your database

module.exports = (sequelize, Sequelize) => {
    const Data = sequelize.define("data", {
        ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
        sensor_name: { type: DataTypes.STRING(100), allowNull: false },
        timestamp: { type: DataTypes.DATE, allowNull: false },
        external_temperature: { type: DataTypes.DOUBLE, allowNull: false },
        temperature: { type: DataTypes.DOUBLE, allowNull: false },
        humidity: { type: DataTypes.DOUBLE, allowNull: false },
        pressure: { type: DataTypes.DOUBLE, allowNull: false },
    },
    {
        timestamps: false,
    });
    
    return Data;
};