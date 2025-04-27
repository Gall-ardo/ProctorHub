// models/Exam.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Exam = sequelize.define("Exam", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  isOutdated: DataTypes.BOOLEAN,
  date: DataTypes.DATE,
  duration: DataTypes.INTEGER,
  examType: DataTypes.STRING,
  proctorNum: DataTypes.INTEGER,
  manualAssignedTAs: DataTypes.INTEGER,
  autoAssignedTAs: DataTypes.INTEGER,
});

module.exports = Exam;