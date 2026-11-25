const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TechnicianProfile",
    required: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
  },

  scheduledAt: {
    type: String,
    required: true,
    trim: true,
    match: [
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      "Date must follow YYYY-MM-DD HH:mm format",
    ],
  },

  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "ServiceRequest",
  serviceRequestSchema
);