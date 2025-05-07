const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Secretary = sequelize.define("Secretary", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  department: DataTypes.STRING,
});

module.exports = Secretary;