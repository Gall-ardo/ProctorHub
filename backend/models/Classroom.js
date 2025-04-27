// models/Classroom.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Classroom = sequelize.define("Classroom", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  building: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
  examSeatingCapacity: DataTypes.INTEGER,
});

module.exports = Classroom;