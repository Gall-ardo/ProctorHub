const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware to handle JSON requests

app.get("/", (req, res) => {
  res.send("sude irem elif yunus arda");
});

const examsRoutes = require('./api/exams/exams');
const swapsRoutes = require('./api/swaps/swaps');
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // or "*" for any origin
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use('/api/exams', examsRoutes);
app.use('/api/swaps', swapsRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
