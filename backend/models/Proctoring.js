// models/Proctoring.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Proctoring = sequelize.define("Proctoring", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  examId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  assignmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isManualAssignment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  assignedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'SWAPPED', 'CANCELLED'),
    defaultValue: 'PENDING',
  }
});

module.exports = Proctoring;