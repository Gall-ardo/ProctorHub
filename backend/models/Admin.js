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

Admin.belongsTo(User, { foreignKey: "id", as: "user" });

module.exports = Admin;
