// models/Log.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Log = sequelize.define("Log", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  timestamp: DataTypes.DATE,
  action: DataTypes.STRING,
  details: DataTypes.TEXT,
});

module.exports = Log;
