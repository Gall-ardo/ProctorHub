const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TARequest = sequelize.define("TARequest", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  instructorId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    defaultValue: 'Medium',
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
});

module.exports = TARequest;
