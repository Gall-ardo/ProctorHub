const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define("LeaveRequest", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("waiting", "approved", "rejected"),
    allowNull: false,
    defaultValue: "waiting",
  },
  rejectionReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  filePath: {
    type: DataTypes.STRING, // store filename or full path
    allowNull: true,
  },
  taId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'TeachingAssistants',
      key: 'id',
    },
  },
});

module.exports = LeaveRequest;
