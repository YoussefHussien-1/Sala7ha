require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");

const User = require("./models/User");
const TechnicianProfile = require("./models/TechnicianProfile");
const ServiceRequest = require("./models/ServiceRequest");

const testModels = async () => {
  let customer;
  let technicianUser;
  let technicianProfile;
  let serviceRequest;

  try {
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

    console.log("User Model: PASSED");

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
    technicianProfile = await TechnicianProfile.create({
      userId: technicianUser._id,
      experienceYears: 5,
      bio: "Test Technician",
      isAvailable: true,
    });

    if (technicianProfile.specialty !== "General") {
      throw new Error("Default specialty test failed");
    }

    console.log("TechnicianProfile Model: PASSED");

    // 4. Create Service Request
    serviceRequest = await ServiceRequest.create({
      customerId: customer._id,
      technicianId: technicianProfile._id,
      description: "Water leakage in kitchen",
      address: "Giza, Egypt",
      scheduledAt: "2026-11-27 14:00",
    });

    console.log("ServiceRequest Model: PASSED");

    // 5. Check default status
    if (serviceRequest.status !== "PENDING") {
      throw new Error("Default request status test failed");
    }

    console.log("Default Status: PASSED");

    // 6. Test relationships
    const savedRequest = await ServiceRequest.findById(
      serviceRequest._id
    )
      .populate("customerId", "name email")
      .populate({
        path: "technicianId",
        populate: {
          path: "userId",
          select: "name email phone area",
        },
      });

    console.log("\nCustomer:", savedRequest.customerId.name);

    console.log(
      "Technician:",
      savedRequest.technicianId.userId.name
    );

    // 7. Test virtual relationships
    const customerWithRequests = await User.findById(
      customer._id
    ).populate("customerRequests");

    const technicianWithRequests =
      await TechnicianProfile.findById(
        technicianProfile._id
      ).populate("assignedRequests");

    const technicianAccount = await User.findById(
      technicianUser._id
    ).populate("technicianProfile");

    if (
      customerWithRequests.customerRequests.length !== 1 ||
      technicianWithRequests.assignedRequests.length !== 1 ||
      !technicianAccount.technicianProfile
    ) {
      throw new Error("Relationship test failed");
    }

    console.log("Relationships: PASSED");

    console.log("\nALL MODELS TESTS PASSED!");

  } catch (error) {
    console.error("\nTEST FAILED:", error.message);
    process.exitCode = 1;

  } finally {
    try {
      if (serviceRequest) {
        await ServiceRequest.deleteOne({
          _id: serviceRequest._id,
        });
      }

      if (technicianProfile) {
        await TechnicianProfile.deleteOne({
          _id: technicianProfile._id,
        });
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

    } finally {
      await mongoose.disconnect();
    }
  }
};

testModels();