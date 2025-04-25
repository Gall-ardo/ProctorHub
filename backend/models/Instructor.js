// models/Instructor.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Instructor = sequelize.define("Instructor", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

Instructor.belongsTo(User, { foreignKey: "id", as: "user" });

module.exports = Instructor;
