const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const TechnicianProfile = require("../models/TechnicianProfile");

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ================= REGISTER =================
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

    // Check required fields
    const requiredFields = [name, email, password, phone, area];

    if (
      !requiredFields.every(
        (field) => typeof field === "string" && field.trim().length > 0
      )
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Normalize email and role
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole =
      typeof role === "string" ? role.toUpperCase() : "";

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Validate role
    if (!["CUSTOMER", "TECHNICIAN"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim(),
      role: normalizedRole,
      area: area.trim(),
    });

    createdUserId = user._id;

    // Create TechnicianProfile if user is a technician
    if (normalizedRole === "TECHNICIAN") {
      await TechnicianProfile.create({
        userId: user._id,
        specialty: specialty || "General",
        experienceYears: experienceYears ?? 0,
        bio: bio || "",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: userData,
    });

  } catch (error) {
    // Cleanup if registration fails after user creation
    if (createdUserId) {
      try {
        await TechnicianProfile.findOneAndDelete({
          userId: createdUserId,
        });

        await User.findByIdAndDelete(createdUserId);
      } catch (cleanupError) {
        console.error("Registration Cleanup Error:", cleanupError.message);
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.error("Register Error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password before sending response
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};