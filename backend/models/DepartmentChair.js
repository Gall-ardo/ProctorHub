const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DepartmentChair = sequelize.define("DepartmentChair", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

module.exports = DepartmentChair;