const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["CUSTOMER", "TECHNICIAN"],
      required: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One-to-One relationship with TechnicianProfile
userSchema.virtual("technicianProfile", {
  ref: "TechnicianProfile",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// One-to-Many relationship with ServiceRequest
userSchema.virtual("customerRequests", {
  ref: "ServiceRequest",
  localField: "_id",
  foreignField: "customerId",
});

module.exports = mongoose.model("User", userSchema);