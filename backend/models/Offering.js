// models/Offering.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Offering = sequelize.define("Offering", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  instructor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sectionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'Offerings',  // Explicitly set table name to match your DB
  timestamps: true
});

module.exports = Offering;