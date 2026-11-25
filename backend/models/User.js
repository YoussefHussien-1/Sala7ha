const {
  EGYPT_GOVERNORATES,
} = require("../constants/egyptGovernorates");

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
  match: [
    /^01[0125]\d{8}$/,
    "Invalid Egyptian mobile number",
  ],
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
  enum: {
    values: EGYPT_GOVERNORATES.map((item) => item.value),
    message: "Invalid Egyptian governorate",
  },
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