// models/TimeSlot.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TimeSlot = sequelize.define("TimeSlot", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  day: {
    type: DataTypes.ENUM("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
    allowNull: false,
  },
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
});

module.exports = TimeSlot;
