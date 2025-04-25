// models/Admin.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Admin = sequelize.define("Admin", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
});

module.exports = Admin;
