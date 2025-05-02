// models/Student.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

module.exports = Student;