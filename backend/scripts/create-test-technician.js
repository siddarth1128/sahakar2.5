const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import User model
const User = require("../models/User");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg) =>
    console.log(
      `\n${colors.bright}${colors.blue}${"=".repeat(70)}\n${msg}\n${"=".repeat(70)}${colors.reset}\n`,
    ),
};

/**
 * Test technician accounts with credentials
 */
const testTechnicians = [
  {
    firstName: "John",
    lastName: "Technician",
    email: "tech@test.com",
    password: "tech123",
    phone: "+91 98765 43210",
    userType: "technician",
    isVerified: true,
    isActive: true,
    technicianDetails: {
      services: ["Plumbing", "Electrical", "AC Repair"],
      experience: "5 years",
      rating: 4.8,
      totalReviews: 50,
      hourlyRate: 500,
      availability: "available",
      bio: "Experienced technician specializing in plumbing, electrical work, and AC repairs. Available for both emergency and scheduled services.",
      certifications: [
        "Licensed Plumber",
        "Electrical Safety Certificate",
        "HVAC Certified",
      ],
      completedJobs: 150,
    },
    address: {
      street: "123 Tech Street",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
    },
  },
  {
    firstName: "Sarah",
    lastName: "Electrician",
    email: "electrician@test.com",
    password: "electrician123",
    phone: "+91 98765 43211",
    userType: "technician",
    isVerified: true,
    isActive: true,
    technicianDetails: {
      services: ["Electrical", "Wiring", "Smart Home Installation"],
      experience: "7 years",
      rating: 4.9,
      totalReviews: 75,
      hourlyRate: 600,
      availability: "available",
      bio: "Licensed electrician with expertise in residential and commercial wiring, panel upgrades, and smart home installations.",
      certifications: [
        "Master Electrician License",
        "Smart Home Certified",
        "Solar Installation",
      ],
      completedJobs: 200,
    },
    address: {
      street: "456 Electric Ave",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
    },
  },
  {
    firstName: "Mike",
    lastName: "Plumber",
    email: "plumber@test.com",
    password: "plumber123",
    phone: "+91 98765 43212",
    userType: "technician",
    isVerified: true,
    isActive: true,
    technicianDetails: {
      services: ["Plumbing", "Bathroom Fitting", "Water Heater", "Leak Repair"],
      experience: "6 years",
      rating: 4.85,
      totalReviews: 60,
      hourlyRate: 550,
      availability: "available",
      bio: "Professional plumber specializing in leak repairs, bathroom fittings, and water heater installations. Fast and reliable service.",
      certifications: [
        "Certified Plumber",
        "Gas Line Installation",
        "Pipe Fitting Expert",
      ],
      completedJobs: 180,
    },
    address: {
      street: "789 Pipe Lane",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
    },
  },
  {
    firstName: "Lisa",
    lastName: "ACTech",
    email: "actech@test.com",
    password: "actech123",
    phone: "+91 98765 43213",
    userType: "technician",
    isVerified: true,
    isActive: true,
    technicianDetails: {
      services: [
        "AC Repair",
        "AC Installation",
        "Refrigerator Repair",
        "Washing Machine",
      ],
      experience: "8 years",
      rating: 4.95,
      totalReviews: 90,
      hourlyRate: 650,
      availability: "available",
      bio: "HVAC specialist with 8 years experience. Expert in AC repair, installation, and maintenance. Also handles refrigerator and washing machine repairs.",
      certifications: [
        "HVAC Master Technician",
        "Refrigeration Certified",
        "EPA Certified",
      ],
      completedJobs: 250,
    },
    address: {
      street: "321 Cool Street",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500001",
      country: "India",
    },
  },
];

/**
 * Create or update test technician accounts
 */
const createTestTechnicians = async () => {
  try {
    log.header("Test Technician Account Setup");

    // Connect to MongoDB
    log.info("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    log.success("Connected to MongoDB");

    console.log("\n");

    for (const techData of testTechnicians) {
      try {
        // Check if technician already exists
        let technician = await User.findOne({ email: techData.email });

        if (technician) {
          log.warning(`Technician already exists: ${techData.email}`);

          // Update password and details using updateOne to avoid double hashing
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(techData.password, salt);

          await User.updateOne(
            { email: techData.email },
            {
              $set: {
                password: hashedPassword,
                isVerified: true,
                isActive: true,
                technicianDetails: techData.technicianDetails,
                address: techData.address,
                phone: techData.phone,
              },
            },
          );

          // Fetch updated technician
          technician = await User.findOne({ email: techData.email });
          log.success(`Updated: ${techData.firstName} ${techData.lastName}`);
        } else {
          // Hash password before creating
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(techData.password, salt);

          // Create new technician with pre-hashed password
          technician = new User({
            ...techData,
            password: hashedPassword,
          });

          // Save without triggering pre-save hook double hashing
          await technician.save();
          log.success(`Created: ${techData.firstName} ${techData.lastName}`);
        }

        // Display credentials
        console.log(`   Email: ${colors.cyan}${techData.email}${colors.reset}`);
        console.log(
          `   Password: ${colors.cyan}${techData.password}${colors.reset}`,
        );
        console.log(
          `   Services: ${techData.technicianDetails.services.join(", ")}`,
        );
        console.log(
          `   Status: ${technician.isVerified ? colors.green + "Verified ✓" : colors.red + "Not Verified ✗"}${colors.reset}`,
        );
        console.log(
          `   Active: ${technician.isActive ? colors.green + "Active ✓" : colors.red + "Inactive ✗"}${colors.reset}`,
        );
        console.log("");
      } catch (error) {
        log.error(`Failed to create ${techData.email}: ${error.message}`);
      }
    }

    log.header("Test Accounts Created Successfully!");

    console.log(`${colors.bright}Login Credentials:${colors.reset}\n`);
    console.log(
      "┌─────────────────────────────────────────────────────────────────┐",
    );
    console.log(
      "│                    TECHNICIAN TEST ACCOUNTS                     │",
    );
    console.log(
      "├─────────────────────────────────────────────────────────────────┤",
    );

    testTechnicians.forEach((tech, index) => {
      console.log(
        `│ ${index + 1}. ${tech.firstName} ${tech.lastName} (${tech.technicianDetails.services[0]})`.padEnd(
          66,
        ) + "│",
      );
      console.log(`│    Email:    ${tech.email}`.padEnd(66) + "│");
      console.log(`│    Password: ${tech.password}`.padEnd(66) + "│");
      if (index < testTechnicians.length - 1) {
        console.log(
          "├─────────────────────────────────────────────────────────────────┤",
        );
      }
    });

    console.log(
      "└─────────────────────────────────────────────────────────────────┘\n",
    );

    console.log(`${colors.yellow}Quick Login:${colors.reset}`);
    console.log(`  Email:    ${colors.cyan}tech@test.com${colors.reset}`);
    console.log(`  Password: ${colors.cyan}tech123${colors.reset}\n`);

    log.info("All test technicians are:");
    log.success("✓ Verified (can login immediately)");
    log.success("✓ Active (visible to customers)");
    log.success("✓ Have services configured");
    log.success("✓ Ready to receive booking requests\n");

    console.log(
      `${colors.bright}Login URL:${colors.reset} http://localhost:3000/login\n`,
    );
  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    log.info("MongoDB connection closed");
  }
};

// Run the script
createTestTechnicians();
