const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Instructor = sequelize.define("Instructor", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
  // Remove userId field since we're using id as the foreign key
});

// Remove any association here - it's defined in index.js

module.exports = Instructor;