const express = require("express");
const cors = require("cors");
require('dotenv').config();
require("./models"); // This ensures all models and associations are registered


const sequelize = require("./config/db");

// Import models directly for testing
const User = require("./models/User");
const TeachingAssistant = require("./models/TeachingAssistant");
const Workload = require("./models/Workload");
const Course = require("./models/Course");

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



// Database diagnostic route
app.get("/api/test-db", async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Test model access
    const userCount = await User.count();
    const taCount = await TeachingAssistant.count();
    const workloadCount = await Workload.count();
    
    res.json({
      success: true,
      message: 'Database connection and models are working correctly',
      counts: {
        users: userCount,
        tas: taCount,
        workloads: workloadCount
      }
    });
  } catch (error) {
    console.error('Database diagnostic error:', error);
    res.status(500).json({
      success: false,
      message: 'Database diagnostic failed',
      error: error.message
    });
  }
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

sequelize.sync(syncOptions)
  .then(() => {
    console.log("✅ DB synced with options:", syncOptions);

    // ✅ Add this line to log all registered models
    console.log("Synced models:", Object.keys(sequelize.models));

    // Test model loading after sync
    Promise.all([
      User.findAll({ limit: 1 }),
      TeachingAssistant.findAll({ limit: 1 }),
      Workload.findAll({ limit: 1 })
    ])
    .then(([users, tas, workloads]) => {
      console.log("✅ Model test - User model loaded, found", users.length, "users");
      console.log("✅ Model test - TeachingAssistant model loaded, found", tas.length, "TAs");
      console.log("✅ Model test - Workload model loaded, found", workloads.length, "workloads");
    })
    .catch(err => {
      console.error("❌ Model test failed:", err.message);
    });
  })
  .catch(err => {
    console.error("❌ DB sync failed:", err);
  });


const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});