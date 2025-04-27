const express = require("express");
const cors = require('cors');  // Add this line
require('dotenv').config();
const sequelize = require("./config/db");

// Load all models and relationships
require("./models");
const { User } = sequelize.models;

const app = express();
app.use(cors());  // Add this line
app.use(express.json());

app.use("/api/admin/offerings", require("./routes/Admin/offeringRoutes"));


// Test route
app.get("/", (req, res) => {
  res.send("🚀 ProctorHub Backend Running");
});

// Sync database (can also be inside models/index.js)
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ DB synced");
});

/*
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();           // SELECT * FROM Users
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one user by id
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('Not found');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);  // expects JSON { id, name, email, password, userType }
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});*/

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});
