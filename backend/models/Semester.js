// models/Semester.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Semester = sequelize.define("Semester", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  year: DataTypes.INTEGER,
  // make enum for fall, spring, summer
  semesterType: {
    type: DataTypes.ENUM('FALL', 'SPRING', 'SUMMER'),
    allowNull: false,
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
});

module.exports = Semester;
