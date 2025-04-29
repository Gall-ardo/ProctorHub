const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const passwordResetToken = sequelize.define("passwordResetToken", {
  token: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

module.exports = passwordResetToken;