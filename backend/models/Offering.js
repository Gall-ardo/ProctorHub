// models/Offering.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Offering = sequelize.define("Offering", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  sectionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Add courseId and semesterId for relationships
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semesterId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Offering;