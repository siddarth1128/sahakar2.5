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

// Clean unverified users
const cleanUnverifiedUsers = async () => {
  try {
    console.log("\n🔍 Searching for unverified users...\n");

    // Find all users who are not verified
    const unverifiedUsers = await User.find({
      isVerified: false,
    });

    console.log(`📊 Found ${unverifiedUsers.length} unverified user(s)\n`);

    if (unverifiedUsers.length === 0) {
      console.log("✅ No unverified users to clean up!\n");
      return;
    }

    // Display unverified users
    console.log("Unverified Users:");
    console.log("─".repeat(80));
    unverifiedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User Type: ${user.userType}`);
      console.log(`   Google ID: ${user.googleId || "Not linked"}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log("─".repeat(80));
    });

    // Delete unverified users
    console.log("\n🗑️  Deleting unverified users...\n");

    const result = await User.deleteMany({
      isVerified: false,
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} unverified user(s)!\n`);

    // Show remaining users
    const remainingUsers = await User.countDocuments();
    console.log(`📊 Remaining verified users in database: ${remainingUsers}\n`);

  } catch (error) {
    console.error("❌ Error cleaning unverified users:", error.message);
    throw error;
  }
};

// Clean old unverified users (older than 24 hours)
const cleanOldUnverifiedUsers = async (hoursOld = 24) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

    console.log(`\n🔍 Searching for unverified users older than ${hoursOld} hours...\n`);

    const oldUnverifiedUsers = await User.find({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    console.log(`📊 Found ${oldUnverifiedUsers.length} old unverified user(s)\n`);

    if (oldUnverifiedUsers.length === 0) {
      console.log("✅ No old unverified users to clean up!\n");
      return;
    }

    // Display old unverified users
    console.log(`Unverified Users (older than ${hoursOld} hours):`);
    console.log("─".repeat(80));
    oldUnverifiedUsers.forEach((user, index) => {
      const ageInHours = Math.floor(
        (new Date() - user.createdAt) / (1000 * 60 * 60)
      );
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User Type: ${user.userType}`);
      console.log(`   Created: ${user.createdAt} (${ageInHours} hours ago)`);
      console.log("─".repeat(80));
    });

    // Delete old unverified users
    console.log(`\n🗑️  Deleting old unverified users...\n`);

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} old unverified user(s)!\n`);

    // Show remaining users
    const remainingUnverified = await User.countDocuments({ isVerified: false });
    const remainingVerified = await User.countDocuments({ isVerified: true });
    console.log(`📊 Remaining unverified users: ${remainingUnverified}`);
    console.log(`📊 Remaining verified users: ${remainingVerified}\n`);

  } catch (error) {
    console.error("❌ Error cleaning old unverified users:", error.message);
    throw error;
  }
};

// List all users
const listAllUsers = async () => {
  try {
    console.log("\n📋 Listing all users in database...\n");

    const allUsers = await User.find({}).select(
      "firstName lastName email userType isVerified googleId createdAt"
    );

    console.log(`📊 Total users: ${allUsers.length}\n`);

    if (allUsers.length === 0) {
      console.log("❌ No users found in database!\n");
      return;
    }

    console.log("All Users:");
    console.log("─".repeat(100));

    const verified = [];
    const unverified = [];

    allUsers.forEach((user) => {
      if (user.isVerified) {
        verified.push(user);
      } else {
        unverified.push(user);
      }
    });

    // Display verified users
    if (verified.length > 0) {
      console.log("\n✅ VERIFIED USERS:");
      console.log("─".repeat(100));
      verified.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.firstName} ${user.lastName} | ${user.email} | ${user.userType} | ${
            user.googleId ? "Google Linked" : "Email/Password"
          }`
        );
      });
    }

    // Display unverified users
    if (unverified.length > 0) {
      console.log("\n⚠️  UNVERIFIED USERS:");
      console.log("─".repeat(100));
      unverified.forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.firstName} ${user.lastName} | ${user.email} | ${user.userType} | Created: ${user.createdAt}`
        );
      });
    }

    console.log("\n" + "─".repeat(100));
    console.log(`📊 Summary: ${verified.length} verified, ${unverified.length} unverified\n`);

  } catch (error) {
    console.error("❌ Error listing users:", error.message);
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
    const hours = parseInt(args[1]) || 24;

    console.log("\n" + "=".repeat(80));
    console.log("🧹 FIXITNOW - USER CLEANUP UTILITY");
    console.log("=".repeat(80));

    switch (command) {
      case "list":
        await listAllUsers();
        break;

      case "clean-all":
        await cleanUnverifiedUsers();
        break;

      case "clean-old":
        await cleanOldUnverifiedUsers(hours);
        break;

      case "help":
      default:
        console.log("\n📖 USAGE:\n");
        console.log("  node scripts/cleanUnverifiedUsers.js <command> [options]\n");
        console.log("COMMANDS:\n");
        console.log("  list           - List all users (verified and unverified)");
        console.log("  clean-all      - Delete ALL unverified users");
        console.log("  clean-old [N]  - Delete unverified users older than N hours (default: 24)");
        console.log("  help           - Show this help message\n");
        console.log("EXAMPLES:\n");
        console.log("  node scripts/cleanUnverifiedUsers.js list");
        console.log("  node scripts/cleanUnverifiedUsers.js clean-all");
        console.log("  node scripts/cleanUnverifiedUsers.js clean-old 48");
        console.log("  node scripts/cleanUnverifiedUsers.js clean-old 1\n");
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
