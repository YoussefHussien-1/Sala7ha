const mongoose = require("mongoose");

const ServiceRequest = require("../models/ServiceRequest");
const TechnicianProfile = require("../models/TechnicianProfile");

// Return all requests created by the currently authenticated customer.
const getCustomerRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      customerId: req.user._id,
    })
      .populate({
        path: "technicianId",
        select: "userId specialty experienceYears",
        populate: {
          path: "userId",
          select: "name email phone area",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("[SERVICE_REQUESTS][CUSTOMER_LIST]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your service requests.",
    });
  }
};

// Return requests assigned to the currently authenticated technician.
// ServiceRequest.technicianId references TechnicianProfile, not User.
const getTechnicianRequests = async (req, res) => {
  try {
    const technicianProfile = await TechnicianProfile.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!technicianProfile) {
      return res.status(404).json({
        success: false,
        message: "Technician profile not found.",
      });
    }

    const requests = await ServiceRequest.find({
      technicianId: technicianProfile._id,
    })
      .populate({
        path: "customerId",
        select: "name email phone area",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("[SERVICE_REQUESTS][TECHNICIAN_LIST]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve incoming service requests.",
    });
  }
};

// A technician may accept or reject only a pending request assigned to them.
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const requestId = req.params.id;

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service request ID.",
      });
    }

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACCEPTED or REJECTED.",
      });
    }

    const technicianProfile = await TechnicianProfile.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!technicianProfile) {
      return res.status(404).json({
        success: false,
        message: "Technician profile not found.",
      });
    }

    // Include PENDING in the query so two simultaneous actions cannot
    // overwrite a status after the first action has already been saved.
    const updatedRequest = await ServiceRequest.findOneAndUpdate(
      {
        _id: requestId,
        technicianId: technicianProfile._id,
        status: "PENDING",
      },
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "customerId",
        select: "name email phone area",
      })
      .populate({
        path: "technicianId",
        select: "userId specialty experienceYears",
        populate: {
          path: "userId",
          select: "name email phone area",
        },
      });

    if (updatedRequest) {
      return res.status(200).json({
        success: true,
        message: `Request ${status.toLowerCase()} successfully.`,
        request: updatedRequest,
      });
    }

    // Explain why the update did not match without exposing another
    // technician's request to the current user.
    const existingRequest = await ServiceRequest.findById(requestId).select(
      "technicianId status"
    );

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Service request not found.",
      });
    }

    if (
      !existingRequest.technicianId ||
      !existingRequest.technicianId.equals(technicianProfile._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this service request.",
      });
    }

    return res.status(409).json({
      success: false,
      message: `This request is already ${existingRequest.status.toLowerCase()}.`,
    });
  } catch (error) {
    console.error("[SERVICE_REQUESTS][UPDATE_STATUS]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update the service request status.",
    });
  }
};

module.exports = {
  getCustomerRequests,
  getTechnicianRequests,
  updateRequestStatus,
};
