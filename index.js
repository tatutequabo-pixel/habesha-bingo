const express = require("express");
const path = require("path");
const app = express();

// Dynamic port for Render
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Handle root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Habesha Bingo running on port ${PORT}`);
});
























