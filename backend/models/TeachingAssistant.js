const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const TeachingAssistant = sequelize.define("TeachingAssistant", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
  totalProctoringInDepartment: DataTypes.INTEGER,
  totalNonDepartmentProctoring: DataTypes.INTEGER,
  totalWorkload: DataTypes.INTEGER,
  isPHD: DataTypes.BOOLEAN,
  approvedAbsence: DataTypes.BOOLEAN,
  waitingAbsenceRequest: DataTypes.BOOLEAN,
  isPartTime: DataTypes.BOOLEAN,
});

// Connect to User
TeachingAssistant.belongsTo(User, { foreignKey: "id", as: "user" });

module.exports = TeachingAssistant;
