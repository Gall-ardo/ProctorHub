// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: DataTypes.STRING,
  userType: {
    type: DataTypes.ENUM("admin", "ta", "instructor", "chair", "dean", "student"),
    allowNull: false,
  },
});

module.exports = User;
