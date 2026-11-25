const express = require("express");

const router = express.Router();

// API Health Check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Home Services API is running!",
  });
});

module.exports = router;