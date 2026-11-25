const mongoose = require("mongoose");

const technicianSchema = new mongoose.Schema(
  {
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
    },

    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Technician", technicianSchema);