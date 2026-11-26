
const User = require("../models/User");
const TechnicianProfile = require("../models/TechnicianProfile");
const { normalizeEgyptianPhone } = require("../utils/registrationValidation");

// GET TECHNICIAN PROFILE
const getTechnicianProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "name email phone area"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const technicianProfile = await TechnicianProfile.findOne({
      userId: user._id,
    });

    if (!technicianProfile) {
      return res.status(404).json({
        message: "Technician profile not found.",
      });
    }

    return res.status(200).json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        area: user.area,
        specialty: technicianProfile.specialty,
        experienceYears: technicianProfile.experienceYears,
        bio: technicianProfile.bio || "",
        isAvailable: technicianProfile.isAvailable,
      },
    });
  } catch (error) {
    console.error("[TECHNICIAN][GET_PROFILE]", error);

    return res.status(500).json({
      message: "Failed to retrieve technician profile.",
    });
  }
};

// UPDATE TECHNICIAN PROFILE
const updateTechnicianProfile = async (req, res) => {
  try {
    const {
      phone,
      specialty,
      experienceYears,
      bio,
    } = req.body || {};

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const technicianProfile = await TechnicianProfile.findOne({
      userId: user._id,
    });

    if (!technicianProfile) {
      return res.status(404).json({
        message: "Technician profile not found.",
      });
    }

    // Validate phone
    let normalizedPhone;

    if (phone !== undefined) {
      if (typeof phone !== "string") {
        return res.status(400).json({
          message: "Phone must be a string.",
        });
      }

      normalizedPhone = normalizeEgyptianPhone(phone);

      if (!normalizedPhone) {
        return res.status(400).json({
          message: "Please enter a valid Egyptian mobile number.",
        });
      }

      const existingPhone = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: user._id },
      });

      if (existingPhone) {
        return res.status(409).json({
          message: "This phone number is already registered.",
        });
      }
    }

    // Validate specialty
    if (specialty !== undefined) {
      if (
        typeof specialty !== "string" ||
        !specialty.trim()
      ) {
        return res.status(400).json({
          message: "Specialty cannot be empty.",
        });
      }
    }

    // Validate experience years
    let normalizedExperience;

    if (experienceYears !== undefined) {
      normalizedExperience = Number(experienceYears);

      if (
        !Number.isInteger(normalizedExperience) ||
        normalizedExperience < 0
      ) {
        return res.status(400).json({
          message:
            "Experience years must be a whole number greater than or equal to zero.",
        });
      }
    }

    // Validate bio
    if (
      bio !== undefined &&
      typeof bio !== "string"
    ) {
      return res.status(400).json({
        message: "Bio must be a string.",
      });
    }

    // Update User document
    if (normalizedPhone !== undefined) {
      user.phone = normalizedPhone;
      await user.save();
    }

    // Update TechnicianProfile document
    if (specialty !== undefined) {
      technicianProfile.specialty = specialty.trim();
    }

    if (normalizedExperience !== undefined) {
      technicianProfile.experienceYears = normalizedExperience;
    }

    if (bio !== undefined) {
      technicianProfile.bio = bio.trim();
    }

    await technicianProfile.save();

    return res.status(200).json({
      message: "Technician profile updated successfully.",
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        area: user.area,
        specialty: technicianProfile.specialty,
        experienceYears: technicianProfile.experienceYears,
        bio: technicianProfile.bio || "",
        isAvailable: technicianProfile.isAvailable,
      },
    });
  } catch (error) {
    console.error("[TECHNICIAN][UPDATE_PROFILE]", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This value is already registered.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update technician profile.",
    });
  }
};

// UPDATE AVAILABILITY STATUS
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body || {};

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message: "isAvailable must be a boolean value.",
      });
    }

    const technicianProfile =
      await TechnicianProfile.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { isAvailable } },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!technicianProfile) {
      return res.status(404).json({
        message: "Technician profile not found.",
      });
    }

    return res.status(200).json({
      message: "Availability status updated successfully.",
      isAvailable: technicianProfile.isAvailable,
    });
  } catch (error) {
    console.error("[TECHNICIAN][UPDATE_AVAILABILITY]", error);

    return res.status(500).json({
      message: "Failed to update availability status.",
    });
  }
};

module.exports = {
  getTechnicianProfile,
  updateTechnicianProfile,
  updateAvailability,
};
