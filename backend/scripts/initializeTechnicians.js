const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import User model
const User = require("../models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Initialize technician details
const initializeTechnicians = async () => {
  try {
    console.log("\n🔍 Searching for technicians without initialized details...\n");

    // Find all technicians who don't have services array initialized
    const techniciansToUpdate = await User.find({
      userType: "technician",
      $or: [
        { "technicianDetails.services": { $exists: false } },
        { "technicianDetails.services": { $size: 0 } },
        { "technicianDetails": { $exists: false } },
      ],
    });

    console.log(`📊 Found ${techniciansToUpdate.length} technician(s) to initialize\n`);

    if (techniciansToUpdate.length === 0) {
      console.log("✅ All technicians already have details initialized!\n");
      return;
    }

    // Display technicians to be updated
    console.log("Technicians to Initialize:");
    console.log("─".repeat(80));
    techniciansToUpdate.forEach((tech, index) => {
      console.log(`${index + 1}. ${tech.firstName} ${tech.lastName}`);
      console.log(`   Email: ${tech.email}`);
      console.log(`   Verified: ${tech.isVerified ? "✅" : "❌"}`);
      console.log(`   Created: ${tech.createdAt}`);
      console.log("─".repeat(80));
    });

    // Update each technician with default values
    console.log("\n🔧 Initializing technician details...\n");

    let updatedCount = 0;
    for (const tech of techniciansToUpdate) {
      // Initialize technicianDetails if it doesn't exist
      if (!tech.technicianDetails) {
        tech.technicianDetails = {};
      }

      // Set default values
      tech.technicianDetails.services = tech.technicianDetails.services || [];
      tech.technicianDetails.experience = tech.technicianDetails.experience || "0-1 years";
      tech.technicianDetails.rating = tech.technicianDetails.rating || 0;
      tech.technicianDetails.totalReviews = tech.technicianDetails.totalReviews || 0;
      tech.technicianDetails.hourlyRate = tech.technicianDetails.hourlyRate || 0;
      tech.technicianDetails.availability = tech.technicianDetails.availability || "available";
      tech.technicianDetails.bio = tech.technicianDetails.bio || "";
      tech.technicianDetails.certifications = tech.technicianDetails.certifications || [];
      tech.technicianDetails.completedJobs = tech.technicianDetails.completedJobs || 0;

      await tech.save();
      updatedCount++;
      console.log(`✅ Initialized: ${tech.firstName} ${tech.lastName}`);
    }

    console.log(`\n✅ Successfully initialized ${updatedCount} technician(s)!\n`);

    // Show all technicians now
    const allTechnicians = await User.find({ userType: "technician" }).select(
      "firstName lastName email isVerified technicianDetails.services createdAt"
    );

    console.log("\n📋 All Technicians Status:");
    console.log("─".repeat(100));
    allTechnicians.forEach((tech, index) => {
      const servicesCount = tech.technicianDetails?.services?.length || 0;
      const status = servicesCount > 0 ? "✅ Profile Complete" : "⚠️  Profile Incomplete (needs to add services)";
      console.log(
        `${index + 1}. ${tech.firstName} ${tech.lastName} | ${tech.email} | ${status}`
      );
    });
    console.log("─".repeat(100));
    console.log(`\n📊 Total: ${allTechnicians.length} technician(s)\n`);

  } catch (error) {
    console.error("❌ Error initializing technicians:", error.message);
    throw error;
  }
};

// Set specific services for a technician
const setTechnicianServices = async (email, services) => {
  try {
    console.log(`\n🔧 Setting services for ${email}...\n`);

    const technician = await User.findOne({
      email: email.toLowerCase(),
      userType: "technician",
    });

    if (!technician) {
      console.log(`❌ Technician with email ${email} not found!\n`);
      return;
    }

    // Ensure technicianDetails exists
    if (!technician.technicianDetails) {
      technician.technicianDetails = {};
    }

    technician.technicianDetails.services = services;
    await technician.save();

    console.log(`✅ Services updated for ${technician.firstName} ${technician.lastName}`);
    console.log(`   Services: ${services.join(", ")}\n`);

  } catch (error) {
    console.error("❌ Error setting services:", error.message);
    throw error;
  }
};

// Add default services to all technicians without services
const addDefaultServices = async () => {
  try {
    console.log("\n🔧 Adding default services to technicians without services...\n");

    const defaultServices = [
      "Plumbing",
      "Electrical",
      "Carpentry",
      "Painting",
      "AC Repair",
      "Appliance Repair",
    ];

    const techniciansWithoutServices = await User.find({
      userType: "technician",
      $or: [
        { "technicianDetails.services": { $size: 0 } },
        { "technicianDetails.services": { $exists: false } },
      ],
    });

    console.log(`📊 Found ${techniciansWithoutServices.length} technician(s) without services\n`);

    if (techniciansWithoutServices.length === 0) {
      console.log("✅ All technicians already have services!\n");
      return;
    }

    let updatedCount = 0;
    for (const tech of techniciansWithoutServices) {
      // Initialize technicianDetails if needed
      if (!tech.technicianDetails) {
        tech.technicianDetails = {};
      }

      // Assign a random service from the default list
      const randomService = defaultServices[Math.floor(Math.random() * defaultServices.length)];
      tech.technicianDetails.services = [randomService];

      await tech.save();
      updatedCount++;
      console.log(`✅ Added "${randomService}" to ${tech.firstName} ${tech.lastName}`);
    }

    console.log(`\n✅ Successfully added services to ${updatedCount} technician(s)!\n`);

  } catch (error) {
    console.error("❌ Error adding default services:", error.message);
    throw error;
  }
};

// List all technicians with their details
const listTechnicians = async () => {
  try {
    console.log("\n📋 Listing all technicians...\n");

    const technicians = await User.find({ userType: "technician" })
      .select("firstName lastName email isVerified technicianDetails createdAt")
      .sort({ createdAt: -1 });

    console.log(`📊 Total Technicians: ${technicians.length}\n`);

    if (technicians.length === 0) {
      console.log("❌ No technicians found in database!\n");
      return;
    }

    console.log("Technician Details:");
    console.log("═".repeat(100));

    technicians.forEach((tech, index) => {
      const services = tech.technicianDetails?.services || [];
      const rating = tech.technicianDetails?.rating || 0;
      const completedJobs = tech.technicianDetails?.completedJobs || 0;
      const verified = tech.isVerified ? "✅" : "❌";

      console.log(`\n${index + 1}. ${tech.firstName} ${tech.lastName} ${verified}`);
      console.log(`   Email: ${tech.email}`);
      console.log(`   Services: ${services.length > 0 ? services.join(", ") : "⚠️  None (needs setup)"}`);
      console.log(`   Rating: ${rating}/5 (${completedJobs} jobs completed)`);
      console.log(`   Registered: ${tech.createdAt.toLocaleDateString()}`);
      console.log("─".repeat(100));
    });

    console.log("\n");

    // Summary
    const withServices = technicians.filter(t => t.technicianDetails?.services?.length > 0).length;
    const withoutServices = technicians.length - withServices;

    console.log("📊 Summary:");
    console.log(`   ✅ With Services: ${withServices}`);
    console.log(`   ⚠️  Without Services: ${withoutServices}`);
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

    // Check command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const email = args[1];
    const services = args.slice(2);

    console.log("\n" + "=".repeat(80));
    console.log("🔧 FIXITNOW - TECHNICIAN INITIALIZATION UTILITY");
    console.log("=".repeat(80));

    switch (command) {
      case "init":
        await initializeTechnicians();
        break;

      case "add-defaults":
        await addDefaultServices();
        break;

      case "set-services":
        if (!email || services.length === 0) {
          console.log("\n❌ Usage: node initializeTechnicians.js set-services <email> <service1> <service2> ...\n");
          process.exit(1);
        }
        await setTechnicianServices(email, services);
        break;

      case "list":
        await listTechnicians();
        break;

      case "help":
      default:
        console.log("\n📖 USAGE:\n");
        console.log("  node scripts/initializeTechnicians.js <command> [options]\n");
        console.log("COMMANDS:\n");
        console.log("  init              - Initialize technicianDetails for all technicians");
        console.log("  add-defaults      - Add random default service to technicians without services");
        console.log("  set-services      - Set specific services for a technician");
        console.log("  list              - List all technicians with their details");
        console.log("  help              - Show this help message\n");
        console.log("EXAMPLES:\n");
        console.log("  node scripts/initializeTechnicians.js init");
        console.log("  node scripts/initializeTechnicians.js add-defaults");
        console.log("  node scripts/initializeTechnicians.js list");
        console.log("  node scripts/initializeTechnicians.js set-services tech@example.com Plumbing Electrical");
        console.log("");
        break;
    }

    console.log("=".repeat(80));
    console.log("✅ Operation completed successfully!");
    console.log("=".repeat(80) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
};

// Run the script
main();
