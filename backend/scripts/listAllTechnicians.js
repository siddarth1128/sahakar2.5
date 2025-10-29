const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import User model
const User = require("../models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected\n");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// List all technicians
const listAllTechnicians = async () => {
  try {
    console.log("=" .repeat(100));
    console.log("📋 ALL TECHNICIANS IN DATABASE");
    console.log("=".repeat(100));
    console.log("");

    const technicians = await User.find({ userType: "technician" })
      .select("firstName lastName email phone technicianDetails isVerified isActive createdAt")
      .sort({ createdAt: -1 });

    if (technicians.length === 0) {
      console.log("❌ No technicians found in database!\n");
      return;
    }

    console.log(`📊 Total Technicians: ${technicians.length}\n`);

    technicians.forEach((tech, index) => {
      const services = tech.technicianDetails?.services || [];
      const rating = tech.technicianDetails?.rating || 0;
      const completedJobs = tech.technicianDetails?.completedJobs || 0;
      const hourlyRate = tech.technicianDetails?.hourlyRate || 0;
      const availability = tech.technicianDetails?.availability || "offline";
      const verified = tech.isVerified ? "✅ Verified" : "❌ Not Verified";
      const active = tech.isActive ? "✅ Active" : "❌ Inactive";

      console.log(`${index + 1}. ${tech.firstName} ${tech.lastName}`);
      console.log(`   Email: ${tech.email}`);
      console.log(`   Phone: ${tech.phone || "Not provided"}`);
      console.log(`   Status: ${verified} | ${active}`);
      console.log(`   Services: ${services.length > 0 ? services.join(", ") : "⚠️  None"}`);
      console.log(`   Rating: ${rating}/5 (${completedJobs} jobs completed)`);
      console.log(`   Hourly Rate: ₹${hourlyRate}`);
      console.log(`   Availability: ${availability}`);
      console.log(`   Registered: ${tech.createdAt.toLocaleDateString()}`);
      console.log("   " + "-".repeat(96));
      console.log("");
    });

    // Summary
    const verified = technicians.filter(t => t.isVerified).length;
    const active = technicians.filter(t => t.isActive).length;
    const withServices = technicians.filter(t => t.technicianDetails?.services?.length > 0).length;

    console.log("📊 SUMMARY:");
    console.log(`   Total: ${technicians.length}`);
    console.log(`   ✅ Verified: ${verified}`);
    console.log(`   ✅ Active: ${active}`);
    console.log(`   🔧 With Services: ${withServices}`);
    console.log("");

    console.log("⚠️  NOTE: Passwords are encrypted and cannot be displayed.");
    console.log("   To reset a password, use the password reset feature or update manually.");
    console.log("");

  } catch (error) {
    console.error("❌ Error listing technicians:", error.message);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await listAllTechnicians();
    console.log("=".repeat(100));
    console.log("✅ Operation completed successfully!");
    console.log("=".repeat(100) + "\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
};

// Run the script
main();
