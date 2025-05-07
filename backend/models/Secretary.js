const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Secretary = sequelize.define('Secretary', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'Secretaries'
});

module.exports = Secretary;