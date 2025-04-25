// models/Course.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  courseCode: DataTypes.STRING,
  courseName: DataTypes.STRING,
  department: DataTypes.STRING,
  credit: DataTypes.INTEGER,
  isGradCourse: DataTypes.BOOLEAN,
});

module.exports = Course;
