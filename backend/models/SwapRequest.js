// models/SwapRequest.js
/*const { DataTypes } = require("sequelize");
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

module.exports = SwapRequest;*/

// models/SwapRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SwapRequest = sequelize.define("SwapRequest", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetTaId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  examId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  respondentExamId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  requestDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isForumPost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
    defaultValue: 'PENDING',
  }
});

module.exports = SwapRequest;