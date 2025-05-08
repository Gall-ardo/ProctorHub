// models/Exam.js
/*const { DataTypes } = require("sequelize");
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

module.exports = Exam;*/

// models/Exam.js (Updated)
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Exam = sequelize.define("Exam", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  courseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  instructorId: {
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
    comment: 'Duration in minutes'
  },
  examType: {
    type: DataTypes.ENUM('MIDTERM', 'FINAL', 'QUIZ', 'OTHER'),
    defaultValue: 'MIDTERM',
  },
  /*classrooms: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Comma separated list of classrooms'
  },*/
  proctorNum: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of proctors needed'
  },
  manualAssignedTAs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  autoAssignedTAs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isOutdated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = Exam;