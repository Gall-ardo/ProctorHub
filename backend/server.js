const express = require("express");
const cors = require("cors");
require('dotenv').config();

const sequelize = require("./config/db");

// Load all models and relationships
require("./models");
const authRoutes = require("./routes/auth");
const routes = require("./routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use('/api', routes);


// Test route
app.get("/", (req, res) => {
  res.send("🚀 ProctorHub Backend Running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

const syncOptions = {
  alter: true
};

// Sync database
sequelize.sync(syncOptions).then(() => {
  console.log("✅ DB synced with options:", syncOptions);
});



const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});