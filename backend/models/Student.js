// models/Student.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

Student.belongsTo(User, { foreignKey: "id", as: "user" });

module.exports = Student;
