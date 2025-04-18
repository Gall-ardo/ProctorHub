const express = require("express");
const sequelize = require("./config/db");

// Import models
const User = require("./models/User");
const TeachingAssistant = require("./models/TeachingAssistant");
// Add more models here as you create them

const app = express();
app.use(express.json());

// Test route (optional)
app.get("/", (req, res) => {
  res.send("🚀 ProctorHub Backend Running");
});

// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ DB synced");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
