require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");

const User = require("./models/User");
const Technician = require("./models/Technician");
const ServiceRequest = require("./models/ServiceRequest");

const testModels = async () => {
  let customer;
  let technicianUser;
  let technicianProfile;
  let serviceRequest;

  try {
    // Connect to MongoDB
    await connectDB();

    console.log("\nStarting Models Test...\n");

    const uniqueId = Date.now();

    // 1. Create Customer
    customer = await User.create({
      name: "Test Customer",
      email: `customer${uniqueId}@example.com`,
      password: "TEST_ONLY_PLACEHOLDER",
      phone: "01000000000",
      role: "CUSTOMER",
      area: "Giza",
    });

    console.log("Customer Model: PASSED");

    // 2. Create Technician User
    technicianUser = await User.create({
      name: "Test Technician",
      email: `technician${uniqueId}@example.com`,
      password: "TEST_ONLY_PLACEHOLDER",
      phone: "01100000000",
      role: "TECHNICIAN",
      area: "Giza",
    });

    // 3. Create Technician Profile
    technicianProfile = await Technician.create({
      userId: technicianUser._id,
      specialty: "Plumbing",
      experienceYears: 5,
      bio: "Test Technician Profile",
      isAvailable: true,
    });

    console.log("Technician Model: PASSED");

    // 4. Create Service Request
    serviceRequest = await ServiceRequest.create({
      customerId: customer._id,
      technicianId: technicianProfile._id,
      description: "Water leakage in kitchen",
      address: "Giza, Egypt",
      scheduledAt: "2026-11-27 14:00",
    });

    console.log("ServiceRequest Model: PASSED");

    // 5. Verify relationships
    const savedRequest = await ServiceRequest.findById(
      serviceRequest._id
    )
      .populate("customerId", "name email")
      .populate({
        path: "technicianId",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    console.log("\nRequest Status:", savedRequest.status);

    console.log("Customer:", savedRequest.customerId.name);

    console.log(
      "Technician:",
      savedRequest.technicianId.userId.name
    );

    console.log("\nALL MODELS TESTS PASSED!");

  } catch (error) {
    console.error("\nTEST FAILED:", error.message);
    process.exitCode = 1;

  } finally {
    // Clean up test data
    try {
      if (serviceRequest) {
        await ServiceRequest.deleteOne({ _id: serviceRequest._id });
      }

      if (technicianProfile) {
        await Technician.deleteOne({ _id: technicianProfile._id });
      }

      if (customer) {
        await User.deleteOne({ _id: customer._id });
      }

      if (technicianUser) {
        await User.deleteOne({ _id: technicianUser._id });
      }

      console.log("\nTest data cleaned up.");

    } catch (cleanupError) {
      console.error("Cleanup Error:", cleanupError.message);
      process.exitCode = 1;
    }

    await mongoose.connection.close();
  }
};

testModels();