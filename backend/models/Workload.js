const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Workload = sequelize.define("Workload", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taskType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rejectionReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  taId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  instructorId: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Workload;