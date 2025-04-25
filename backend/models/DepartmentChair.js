// models/DepartmentChair.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const DepartmentChair = sequelize.define("DepartmentChair", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

DepartmentChair.belongsTo(User, { foreignKey: "id", as: "user" });

module.exports = DepartmentChair;
