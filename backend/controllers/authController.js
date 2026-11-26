const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const TechnicianProfile = require("../models/TechnicianProfile");

const {
  normalizeEgyptianPhone,
  normalizeGovernorate,
} = require("../utils/registrationValidation");

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// Check database connection errors
const isDatabaseConnectionError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  const name = String(error?.name || "").toLowerCase();

  return (
    name.includes("serverselection") ||
    name.includes("mongonetwork") ||
    message.includes("econnrefused") ||
    message.includes("timed out") ||
    message.includes("not connected")
  );
};

// Handle authentication errors
const handleAuthError = (res, error, operation) => {
  console.error(
    `[AUTH][${operation}]`,
    error.stack || error.message || error
  );

  if (error?.code === 11000) {
    return res.status(409).json({
      code: "DUPLICATE_VALUE",
      message: "Email already registered. Try logging in instead.",
    });
  }

  if (error?.name === "ValidationError") {
    const validationMessages = Object.values(error.errors || {})
      .map((item) => item.message)
      .filter(Boolean);

    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message:
        validationMessages[0] ||
        "Please check the submitted information.",
    });
  }

  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({
      code: "DATABASE_UNAVAILABLE",
      message:
        "The database is temporarily unavailable. Check MongoDB Atlas connection.",
    });
  }

  return res.status(500).json({
    code: `${operation}_FAILED`,
    message: `${operation} failed because of a server error. Check the backend terminal.`,
  });
};

// REGISTER
const registerUser = async (req, res) => {
  let createdUserId = null;

  try {
    const {
      name,
      email,
      password,
      phone,
      role = "CUSTOMER",
      area,
      specialty,
      experienceYears,
      bio,
    } = req.body || {};

    // Required fields
    const requiredFields = [
      name,
      email,
      password,
      phone,
      area,
    ];

    const hasAllRequiredFields = requiredFields.every(
      (field) =>
        typeof field === "string" &&
        field.trim().length > 0
    );

    if (!hasAllRequiredFields) {
      return res.status(400).json({
        code: "MISSING_REQUIRED_FIELDS",
        message:
          "Please provide name, email, password, phone, and governorate.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        code: "INVALID_EMAIL",
        message: "Please provide a valid email address.",
      });
    }

    // Validate role
    const normalizedRole =
      typeof role === "string"
        ? role.trim().toUpperCase()
        : "";

    if (!["CUSTOMER", "TECHNICIAN"].includes(normalizedRole)) {
      return res.status(400).json({
        code: "INVALID_ROLE",
        message: "Invalid account type.",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters long.",
      });
    }

    // Validate phone
    const normalizedPhone = normalizeEgyptianPhone(phone);

    if (!normalizedPhone) {
      return res.status(400).json({
        code: "INVALID_PHONE",
        field: "phone",
        message:
          "Please enter a valid Egyptian mobile number (010, 011, 012, or 015).",
      });
    }

    // Validate governorate
    const normalizedArea = normalizeGovernorate(area);

    if (!normalizedArea) {
      return res.status(400).json({
        code: "INVALID_GOVERNORATE",
        field: "area",
        message: "Please select a valid Egyptian governorate.",
      });
    }

    // Validate technician information
    let normalizedExperienceYears = 0;
    let normalizedSpecialty = "General";
    let normalizedBio = "";

    if (normalizedRole === "TECHNICIAN") {
      normalizedExperienceYears = Number(experienceYears ?? 0);

      normalizedSpecialty =
        typeof specialty === "string" && specialty.trim()
          ? specialty.trim()
          : "General";

      normalizedBio =
        typeof bio === "string" ? bio.trim() : "";

      if (
        !Number.isInteger(normalizedExperienceYears) ||
        normalizedExperienceYears < 0
      ) {
        return res.status(400).json({
          code: "INVALID_EXPERIENCE_YEARS",
          message:
            "Experience years must be a whole number greater than or equal to zero.",
        });
      }
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        code: "EMAIL_ALREADY_REGISTERED",
        message: "Email already registered. Try logging in instead.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      role: normalizedRole,
      area: normalizedArea,
    });

    createdUserId = user._id;

    // Create technician profile if needed
    if (normalizedRole === "TECHNICIAN") {
      await TechnicianProfile.create({
        userId: user._id,
        specialty: normalizedSpecialty,
        experienceYears: normalizedExperienceYears,
        bio: normalizedBio,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: userData,
    });

  } catch (error) {

    // Cleanup partially created account
    if (createdUserId) {
      try {
        await TechnicianProfile.findOneAndDelete({
          userId: createdUserId,
        });

        await User.findByIdAndDelete(createdUserId);

      } catch (cleanupError) {
        console.error(
          "[AUTH][REGISTER_CLEANUP]",
          cleanupError.message
        );
      }
    }

    return handleAuthError(res, error, "REGISTER");
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        code: "MISSING_LOGIN_FIELDS",
        message: "Please provide both email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: userData,
    });

  } catch (error) {
    return handleAuthError(res, error, "LOGIN");
  }
};

module.exports = {
  registerUser,
  loginUser,
};