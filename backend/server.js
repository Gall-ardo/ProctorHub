const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('ProctorHub API is running');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});