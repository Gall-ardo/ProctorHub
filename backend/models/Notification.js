// models/Notification.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  subject: DataTypes.STRING,
  message: DataTypes.TEXT,
  date: DataTypes.DATE,
  isRead: DataTypes.BOOLEAN,
});

module.exports = Notification;