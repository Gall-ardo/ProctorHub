const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
  isPartTime: DataTypes.BOOLEAN,
  isMultidepartmentExam: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = TeachingAssistant;