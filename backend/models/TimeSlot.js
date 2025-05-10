// models/TimeSlot.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define the TimeSlot model
const TimeSlot = sequelize.define("TimeSlot", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  day: {
    type: DataTypes.ENUM(
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ),
    allowNull: false,
  },
  startTime: DataTypes.TIME,
  endTime: DataTypes.TIME,

  offeringId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = TimeSlot;