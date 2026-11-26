require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/authRoutes");
const technicianRoutes = require("./routes/technicianRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/technician", technicianRoutes);

// Server Configuration
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Fail fast with a clear message if .env is incomplete
    const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing ${missing.join(", ")} in backend/.env (see backend/.env.example)`);
    }

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