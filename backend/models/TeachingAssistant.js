const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TeachingAssistant = sequelize.define("TeachingAssistant", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  // other fields...
});

module.exports = TeachingAssistant;
