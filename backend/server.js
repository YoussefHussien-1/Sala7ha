require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Home Services API is running!",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();