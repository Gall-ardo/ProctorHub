const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SwapHistory = sequelize.define("SwapHistory", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  examId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  oldProctorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newProctorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  swapDate: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

module.exports = SwapHistory; 