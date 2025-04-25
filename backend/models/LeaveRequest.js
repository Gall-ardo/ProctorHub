// models/LeaveRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define("LeaveRequest", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  reason: DataTypes.STRING,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  isApproved: DataTypes.BOOLEAN,
  rejectionReason: DataTypes.STRING,
});

module.exports = LeaveRequest;
