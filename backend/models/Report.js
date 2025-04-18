// models/Report.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  isProctoring: DataTypes.BOOLEAN,
  isWorkload: DataTypes.BOOLEAN,
  details: DataTypes.TEXT,
});

module.exports = Report;
