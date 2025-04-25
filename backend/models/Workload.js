// models/Workload.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Workload = sequelize.define("Workload", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  taskType: DataTypes.STRING,
  date: DataTypes.DATE,
  duration: DataTypes.INTEGER,
  isApproved: DataTypes.BOOLEAN,
  rejectionReason: DataTypes.STRING,
});

module.exports = Workload;
