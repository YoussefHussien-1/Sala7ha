require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

// Server Configuration
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