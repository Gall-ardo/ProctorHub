const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Instructor = sequelize.define("Instructor", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
  isTaAssigner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Instructor;
