
const express = require("express");
const router = express.Router();

const {
  getTechnicianProfile,
  updateTechnicianProfile,
  updateAvailability,
} = require("../controllers/technicianController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// All routes require an authenticated technician
router.use(protect, authorizeRoles("TECHNICIAN"));

router.get("/profile", getTechnicianProfile);

router.put("/profile", updateTechnicianProfile);

router.patch("/availability", updateAvailability);

module.exports = router;
