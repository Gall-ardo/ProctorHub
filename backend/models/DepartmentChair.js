const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DepartmentChair = sequelize.define("DepartmentChair", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

// Remove any association here - it's defined in index.js

module.exports = DepartmentChair;