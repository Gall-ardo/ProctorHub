// models/DeansOffice.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const DeansOffice = sequelize.define("DeansOffice", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

module.exports = DeansOffice;
