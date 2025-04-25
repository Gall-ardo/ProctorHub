// models/SwapRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SwapRequest = sequelize.define("SwapRequest", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  requestDate: DataTypes.DATE,
  isApproved: DataTypes.BOOLEAN,
  isForumPost: DataTypes.BOOLEAN,
});

module.exports = SwapRequest;
