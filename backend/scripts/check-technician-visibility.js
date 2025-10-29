const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import User model
const User = require('../models/User');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

/**
 * Check if a technician meets visibility requirements
 */
const checkVisibility = (technician) => {
  const checks = {
    userType: technician.userType === 'technician',
    isActive: technician.isActive === true,
    isVerified: technician.isVerified === true,
    hasServices: technician.technicianDetails?.services?.length > 0,
  };

  const allPassed = Object.values(checks).every(check => check === true);

  return {
    ...checks,
    visible: allPassed,
  };
};

/**
 * Display technician visibility status
 */
const displayTechnicianStatus = (technician, index) => {
  console.log(`\n${colors.bright}Technician #${index + 1}:${colors.reset}`);
  console.log(`Name: ${technician.firstName} ${technician.lastName}`);
  console.log(`Email: ${technician.email}`);
  console.log(`ID: ${technician._id}`);

  const status = checkVisibility(technician);

  console.log('\nVisibility Checks:');
  console.log(`  User Type (technician): ${status.userType ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'} ${colors.reset}(${technician.userType})`);
  console.log(`  Is Active:              ${status.isActive ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'} ${colors.reset}(${technician.isActive})`);
  console.log(`  Is Verified:            ${status.isVerified ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'} ${colors.reset}(${technician.isVerified})`);
  console.log(`  Has Services:           ${status.hasServices ? colors.green + '✅ PASS' : colors.red + '❌ FAIL'} ${colors.reset}(${technician.technicianDetails?.services?.length || 0} services)`);

  if (status.hasServices) {
    console.log(`  Services: ${technician.technicianDetails.services.join(', ')}`);
  }

  console.log(`\n${colors.bright}Visibility Status:${colors.reset} ${status.visible ? colors.green + '✅ VISIBLE' : colors.red + '❌ NOT VISIBLE'}${colors.reset}`);

  if (!status.visible) {
    console.log(`\n${colors.yellow}Issues to fix:${colors.reset}`);
    if (!status.userType) console.log('  - User type must be "technician"');
    if (!status.isActive) console.log('  - Account must be active (isActive = true)');
    if (!status.isVerified) console.log('  - Account must be verified (isVerified = true)');
    if (!status.hasServices) console.log('  - Must have at least one service configured');
  }

  console.log(`\n${colors.cyan}${'─'.repeat(60)}${colors.reset}`);
};

/**
 * Main function
 */
const checkTechnicianVisibility = async () => {
  try {
    log.header('Technician Visibility Checker');

    // Connect to MongoDB
    log.info('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Connected to MongoDB');

    // Get command line arguments
    const args = process.argv.slice(2);
    const specificId = args[0];

    if (specificId) {
      // Check specific technician
      log.info(`Checking specific technician: ${specificId}`);

      const technician = await User.findById(specificId);

      if (!technician) {
        log.error(`Technician not found with ID: ${specificId}`);
        process.exit(1);
      }

      displayTechnicianStatus(technician, 0);
    } else {
      // Check all technicians
      log.info('Fetching all technicians...');

      const allTechnicians = await User.find({ userType: 'technician' })
        .select('firstName lastName email userType isActive isVerified technicianDetails');

      if (allTechnicians.length === 0) {
        log.warning('No technicians found in the database');
        process.exit(0);
      }

      log.success(`Found ${allTechnicians.length} technician(s)`);

      // Display each technician
      allTechnicians.forEach((tech, index) => {
        displayTechnicianStatus(tech, index);
      });

      // Summary statistics
      log.header('Summary Statistics');

      const visibleCount = allTechnicians.filter(tech => checkVisibility(tech).visible).length;
      const notVisibleCount = allTechnicians.length - visibleCount;

      console.log(`Total Technicians:     ${allTechnicians.length}`);
      console.log(`${colors.green}Visible:               ${visibleCount}${colors.reset}`);
      console.log(`${colors.red}Not Visible:           ${notVisibleCount}${colors.reset}`);

      // Breakdown of issues
      const issues = {
        notActive: 0,
        notVerified: 0,
        noServices: 0,
        wrongType: 0,
      };

      allTechnicians.forEach(tech => {
        const status = checkVisibility(tech);
        if (!status.visible) {
          if (!status.isActive) issues.notActive++;
          if (!status.isVerified) issues.notVerified++;
          if (!status.hasServices) issues.noServices++;
          if (!status.userType) issues.wrongType++;
        }
      });

      if (notVisibleCount > 0) {
        console.log(`\n${colors.yellow}Issues Breakdown:${colors.reset}`);
        if (issues.notActive > 0) console.log(`  Not Active:    ${issues.notActive}`);
        if (issues.notVerified > 0) console.log(`  Not Verified:  ${issues.notVerified}`);
        if (issues.noServices > 0) console.log(`  No Services:   ${issues.noServices}`);
        if (issues.wrongType > 0) console.log(`  Wrong Type:    ${issues.wrongType}`);
      }

      // Visible technicians query
      console.log(`\n${colors.bright}Visibility Query (for API):${colors.reset}`);
      console.log(`{
  userType: 'technician',
  isActive: true,
  isVerified: true,
  'technicianDetails.services': { $exists: true, $ne: [] }
}`);

      // Test the actual query
      const visibleTechnicians = await User.find({
        userType: 'technician',
        isActive: true,
        isVerified: true,
        'technicianDetails.services': { $exists: true, $ne: [] }
      });

      console.log(`\n${colors.bright}API Query Result:${colors.reset}`);
      log.success(`${visibleTechnicians.length} technician(s) would be returned by the API`);

      if (visibleTechnicians.length > 0) {
        console.log('\nVisible Technicians:');
        visibleTechnicians.forEach(tech => {
          console.log(`  - ${tech.firstName} ${tech.lastName} (${tech.email})`);
          console.log(`    Services: ${tech.technicianDetails.services.join(', ')}`);
          console.log(`    Availability: ${tech.technicianDetails.availability || 'not set'}`);
        });
      }
    }

    log.header('Check Complete');

  } catch (error) {
    log.error(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    log.info('MongoDB connection closed');
  }
};

// Run the script
checkTechnicianVisibility();
