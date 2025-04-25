// models/Offering.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Offering = sequelize.define("Offering", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  sectionNumber: DataTypes.INTEGER,
  studentCount: DataTypes.INTEGER,
});

module.exports = Offering;
