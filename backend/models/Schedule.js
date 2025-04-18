// models/Schedule.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Schedule = sequelize.define("Schedule", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

module.exports = Schedule;
