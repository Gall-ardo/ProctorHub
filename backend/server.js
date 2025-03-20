const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware to handle JSON requests

app.get("/", (req, res) => {
  res.send("sude irem elif yunus arda");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
