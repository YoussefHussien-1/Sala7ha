const mongoose = require("mongoose");

const technicianProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  specialty: {
    type: String,
    required: true,
    trim: true,
    default: "General",
  },

  experienceYears: {
    type: Number,
    default: 0,
    min: 0,
  },

  bio: {
    type: String,
    trim: true,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
});

// One-to-Many relationship with ServiceRequest
technicianProfileSchema.virtual("assignedRequests", {
  ref: "ServiceRequest",
  localField: "_id",
  foreignField: "technicianId",
});

technicianProfileSchema.set("toJSON", { virtuals: true });
technicianProfileSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model(
  "TechnicianProfile",
  technicianProfileSchema
);