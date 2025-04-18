// models/Semester.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Semester = sequelize.define("Semester", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  year: DataTypes.INTEGER,
  isFall: DataTypes.BOOLEAN,
});

module.exports = Semester;
