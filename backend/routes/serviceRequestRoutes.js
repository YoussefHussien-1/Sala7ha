const express = require("express");
const router = express.Router();

const {
  getCustomerRequests,
  getTechnicianRequests,
  updateRequestStatus,
} = require("../controllers/serviceRequestController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// All service-request dashboard endpoints require authentication.
router.use(protect);

router.get(
  "/customer",
  authorizeRoles("CUSTOMER"),
  getCustomerRequests
);

router.get(
  "/technician",
  authorizeRoles("TECHNICIAN"),
  getTechnicianRequests
);

router.patch(
  "/:id/status",
  authorizeRoles("TECHNICIAN"),
  updateRequestStatus
);

module.exports = router;
