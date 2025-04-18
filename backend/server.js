const express = require("express");
const sequelize = require("./config/db");

// Import all models and relationships from one place
require("./models"); // <- this loads index.js inside /models

const app = express();
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 ProctorHub Backend Running");
});

// Sync database (can also be inside models/index.js)
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ DB synced");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
