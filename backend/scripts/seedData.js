const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Technician = require("../models/Technician");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Notification = require("../models/Notification");

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = {
  customers: [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+1234567890",
      password: "Customer123!",
      userType: "customer",
      isVerified: true,
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1234567891",
      password: "Customer123!",
      userType: "customer",
      isVerified: true,
      address: {
        street: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90001",
        country: "USA",
      },
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      phone: "+1234567892",
      password: "Customer123!",
      userType: "customer",
      isVerified: true,
      address: {
        street: "789 Pine Road",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "USA",
      },
    },
  ],
  technicians: [
    {
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@example.com",
      phone: "+1234567893",
      password: "Technician123!",
      userType: "technician",
      isVerified: true,
      address: {
        street: "321 Elm Street",
        city: "New York",
        state: "NY",
        zipCode: "10002",
        country: "USA",
      },
    },
    {
      firstName: "Robert",
      lastName: "Martinez",
      email: "robert.martinez@example.com",
      phone: "+1234567894",
      password: "Technician123!",
      userType: "technician",
      isVerified: true,
      address: {
        street: "654 Maple Drive",
        city: "New York",
        state: "NY",
        zipCode: "10003",
        country: "USA",
      },
    },
    {
      firstName: "Jennifer",
      lastName: "Garcia",
      email: "jennifer.garcia@example.com",
      phone: "+1234567895",
      password: "Technician123!",
      userType: "technician",
      isVerified: true,
      address: {
        street: "987 Cedar Lane",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90002",
        country: "USA",
      },
    },
    {
      firstName: "James",
      lastName: "Anderson",
      email: "james.anderson@example.com",
      phone: "+1234567896",
      password: "Technician123!",
      userType: "technician",
      isVerified: true,
      address: {
        street: "147 Birch Avenue",
        city: "Chicago",
        state: "IL",
        zipCode: "60602",
        country: "USA",
      },
    },
    {
      firstName: "Linda",
      lastName: "Taylor",
      email: "linda.taylor@example.com",
      phone: "+1234567897",
      password: "Technician123!",
      userType: "technician",
      isVerified: true,
      address: {
        street: "258 Spruce Court",
        city: "New York",
        state: "NY",
        zipCode: "10004",
        country: "USA",
      },
    },
  ],
  admin: {
    firstName: "Admin",
    lastName: "User",
    email: "admin@fixitreview.com",
    phone: "+1234567899",
    password: "Admin123!",
    userType: "admin",
    isVerified: true,
    secretKey: "ADMIN_SECRET_2024",
  },
};

const technicianProfiles = [
  {
    services: ["Plumbing", "Pipe Repair"],
    specializations: [
      "Emergency Plumbing",
      "Drain Cleaning",
      "Water Heater Repair",
    ],
    experience: {
      years: 8,
      description:
        "Experienced plumber with 8+ years in residential and commercial plumbing",
    },
    isVerified: true,
    rating: {
      overall: 4.8,
      punctuality: 4.9,
      quality: 4.7,
      communication: 4.8,
      professionalism: 4.9,
    },
    totalReviews: 127,
    pricing: {
      hourlyRate: 75,
      minimumCharge: 100,
      emergencyCharge: 50,
      currency: "USD",
    },
    availability: {
      status: "available",
      instantBooking: true,
      schedule: {
        monday: { available: true, slots: ["09:00-17:00"] },
        tuesday: { available: true, slots: ["09:00-17:00"] },
        wednesday: { available: true, slots: ["09:00-17:00"] },
        thursday: { available: true, slots: ["09:00-17:00"] },
        friday: { available: true, slots: ["09:00-17:00"] },
        saturday: { available: true, slots: ["10:00-15:00"] },
        sunday: { available: false, slots: [] },
      },
    },
    location: {
      type: "Point",
      coordinates: [-73.9857, 40.7484], // New York
      address: "321 Elm Street",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      country: "USA",
    },
    serviceRadius: 15,
    bio: "Professional plumber specializing in residential repairs and emergency services. Available 24/7 for urgent issues.",
    languages: ["English", "Spanish"],
    stats: {
      totalJobs: 145,
      completedJobs: 138,
      cancelledJobs: 5,
      rejectedJobs: 2,
      responseTime: 12,
      completionRate: 95.17,
      onTimeRate: 92.5,
    },
    accountStatus: "active",
    providesEmergencyService: true,
    emergencyAvailability: "24/7",
    hasOwnTools: true,
    hasVehicle: true,
    badges: ["Top Rated", "Fast Response", "Verified Pro", "100+ Jobs"],
  },
  {
    services: ["Electrical", "Wiring"],
    specializations: [
      "Home Wiring",
      "Circuit Breakers",
      "Lighting Installation",
    ],
    experience: {
      years: 12,
      description:
        "Master electrician with extensive experience in residential electrical systems",
    },
    isVerified: true,
    rating: {
      overall: 4.9,
      punctuality: 4.8,
      quality: 5.0,
      communication: 4.9,
      professionalism: 4.9,
    },
    totalReviews: 203,
    pricing: {
      hourlyRate: 85,
      minimumCharge: 120,
      emergencyCharge: 60,
      currency: "USD",
    },
    availability: {
      status: "available",
      instantBooking: true,
      schedule: {
        monday: { available: true, slots: ["08:00-18:00"] },
        tuesday: { available: true, slots: ["08:00-18:00"] },
        wednesday: { available: true, slots: ["08:00-18:00"] },
        thursday: { available: true, slots: ["08:00-18:00"] },
        friday: { available: true, slots: ["08:00-18:00"] },
        saturday: { available: true, slots: ["09:00-14:00"] },
        sunday: { available: false, slots: [] },
      },
    },
    location: {
      type: "Point",
      coordinates: [-73.9712, 40.7831], // New York
      address: "654 Maple Drive",
      city: "New York",
      state: "NY",
      zipCode: "10003",
      country: "USA",
    },
    serviceRadius: 20,
    bio: "Licensed master electrician providing safe and reliable electrical services for your home.",
    languages: ["English"],
    stats: {
      totalJobs: 225,
      completedJobs: 218,
      cancelledJobs: 4,
      rejectedJobs: 3,
      responseTime: 8,
      completionRate: 96.89,
      onTimeRate: 94.5,
    },
    accountStatus: "active",
    providesEmergencyService: true,
    emergencyAvailability: "24/7",
    hasOwnTools: true,
    hasVehicle: true,
    badges: [
      "Top Rated",
      "5 Star Pro",
      "Verified Pro",
      "100+ Jobs",
      "Fast Response",
    ],
  },
  {
    services: ["AC Repair", "HVAC"],
    specializations: ["Air Conditioning", "Heating Systems", "Duct Cleaning"],
    experience: {
      years: 6,
      description: "HVAC specialist focusing on AC repair and maintenance",
    },
    isVerified: true,
    rating: {
      overall: 4.7,
      punctuality: 4.6,
      quality: 4.8,
      communication: 4.7,
      professionalism: 4.7,
    },
    totalReviews: 89,
    pricing: {
      hourlyRate: 80,
      minimumCharge: 110,
      emergencyCharge: 55,
      currency: "USD",
    },
    availability: {
      status: "available",
      instantBooking: true,
      schedule: {
        monday: { available: true, slots: ["09:00-17:00"] },
        tuesday: { available: true, slots: ["09:00-17:00"] },
        wednesday: { available: true, slots: ["09:00-17:00"] },
        thursday: { available: true, slots: ["09:00-17:00"] },
        friday: { available: true, slots: ["09:00-17:00"] },
        saturday: { available: true, slots: ["10:00-16:00"] },
        sunday: { available: true, slots: ["10:00-14:00"] },
      },
    },
    location: {
      type: "Point",
      coordinates: [-118.2437, 34.0522], // Los Angeles
      address: "987 Cedar Lane",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90002",
      country: "USA",
    },
    serviceRadius: 12,
    bio: "Certified HVAC technician specializing in AC repair and maintenance. Keep your home cool!",
    languages: ["English", "Spanish"],
    stats: {
      totalJobs: 98,
      completedJobs: 93,
      cancelledJobs: 3,
      rejectedJobs: 2,
      responseTime: 15,
      completionRate: 94.9,
      onTimeRate: 90.3,
    },
    accountStatus: "active",
    providesEmergencyService: true,
    emergencyAvailability: "weekends",
    hasOwnTools: true,
    hasVehicle: true,
    badges: ["Top Rated", "Verified Pro"],
  },
  {
    services: ["Carpentry", "Furniture Repair"],
    specializations: [
      "Custom Furniture",
      "Cabinet Installation",
      "Wood Repair",
    ],
    experience: {
      years: 10,
      description:
        "Master carpenter with expertise in custom woodwork and repairs",
    },
    isVerified: true,
    rating: {
      overall: 4.9,
      punctuality: 4.8,
      quality: 5.0,
      communication: 4.8,
      professionalism: 4.9,
    },
    totalReviews: 156,
    pricing: {
      hourlyRate: 70,
      minimumCharge: 90,
      emergencyCharge: 0,
      currency: "USD",
    },
    availability: {
      status: "available",
      instantBooking: true,
      schedule: {
        monday: { available: true, slots: ["08:00-16:00"] },
        tuesday: { available: true, slots: ["08:00-16:00"] },
        wednesday: { available: true, slots: ["08:00-16:00"] },
        thursday: { available: true, slots: ["08:00-16:00"] },
        friday: { available: true, slots: ["08:00-16:00"] },
        saturday: { available: false, slots: [] },
        sunday: { available: false, slots: [] },
      },
    },
    location: {
      type: "Point",
      coordinates: [-87.6298, 41.8781], // Chicago
      address: "147 Birch Avenue",
      city: "Chicago",
      state: "IL",
      zipCode: "60602",
      country: "USA",
    },
    serviceRadius: 18,
    bio: "Skilled carpenter providing quality woodwork and furniture repair services.",
    languages: ["English"],
    stats: {
      totalJobs: 165,
      completedJobs: 160,
      cancelledJobs: 3,
      rejectedJobs: 2,
      responseTime: 20,
      completionRate: 96.97,
      onTimeRate: 93.8,
    },
    accountStatus: "active",
    providesEmergencyService: false,
    emergencyAvailability: "none",
    hasOwnTools: true,
    hasVehicle: true,
    badges: [
      "Top Rated",
      "5 Star Pro",
      "Verified Pro",
      "100+ Jobs",
      "Customer Favorite",
    ],
  },
  {
    services: ["Painting", "Wall Repair"],
    specializations: [
      "Interior Painting",
      "Exterior Painting",
      "Drywall Repair",
    ],
    experience: {
      years: 7,
      description:
        "Professional painter with an eye for detail and quality finishes",
    },
    isVerified: true,
    rating: {
      overall: 4.6,
      punctuality: 4.5,
      quality: 4.7,
      communication: 4.6,
      professionalism: 4.6,
    },
    totalReviews: 72,
    pricing: {
      hourlyRate: 60,
      minimumCharge: 80,
      emergencyCharge: 0,
      currency: "USD",
    },
    availability: {
      status: "available",
      instantBooking: true,
      schedule: {
        monday: { available: true, slots: ["09:00-17:00"] },
        tuesday: { available: true, slots: ["09:00-17:00"] },
        wednesday: { available: true, slots: ["09:00-17:00"] },
        thursday: { available: true, slots: ["09:00-17:00"] },
        friday: { available: true, slots: ["09:00-17:00"] },
        saturday: { available: true, slots: ["10:00-15:00"] },
        sunday: { available: false, slots: [] },
      },
    },
    location: {
      type: "Point",
      coordinates: [-73.9352, 40.7306], // New York
      address: "258 Spruce Court",
      city: "New York",
      state: "NY",
      zipCode: "10004",
      country: "USA",
    },
    serviceRadius: 10,
    bio: "Experienced painter delivering beautiful and lasting finishes for your home.",
    languages: ["English"],
    stats: {
      totalJobs: 78,
      completedJobs: 75,
      cancelledJobs: 2,
      rejectedJobs: 1,
      responseTime: 25,
      completionRate: 96.15,
      onTimeRate: 89.3,
    },
    accountStatus: "active",
    providesEmergencyService: false,
    emergencyAvailability: "none",
    hasOwnTools: true,
    hasVehicle: true,
    badges: ["Verified Pro"],
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Technician.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log("✅ Existing data cleared\n");

    // Create admin user
    console.log("👑 Creating admin user...");
    const adminUser = await User.create(sampleUsers.admin);
    console.log(`✅ Admin created: ${adminUser.email}\n`);

    // Create customers
    console.log("👥 Creating customer users...");
    const customers = [];
    for (const customerData of sampleUsers.customers) {
      const customer = await User.create(customerData);
      customers.push(customer);
      console.log(`✅ Customer created: ${customer.email}`);
    }
    console.log("");

    // REMOVED: Default technician creation
    // Technicians should sign up through the application
    console.log(
      "ℹ️  Technicians will be created when users sign up as technicians\n",
    );
    const technicians = [];

    // Create sample bookings
    console.log("📅 Creating sample bookings...");
    const bookings = [];

    // Skip booking creation if no technicians exist
    if (technicians.length === 0) {
      console.log("ℹ️  Skipping sample bookings (no technicians available)\n");
    } else {
      // Completed booking with review
      const booking1 = await Booking.create({
        customerId: customers[0]._id,
        technicianId: technicians[0].user._id,
        bookingType: "precision",
        serviceType: "Plumbing",
        title: "Kitchen Sink Leak Repair",
        description:
          "The kitchen sink is leaking from the drain. Water is pooling under the sink.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        time: "10:00 AM",
        location: {
          address: "123 Main Street, New York, NY 10001",
          coordinates: {
            latitude: 40.7489,
            longitude: -73.968,
          },
          city: "New York",
          state: "NY",
          zipCode: "10001",
          doorNotes: "Apartment 3B, ring bell twice",
        },
        status: "completed",
        pricing: {
          basePrice: 150,
          distanceFee: 0,
          urgencyFee: 0,
          additionalCharges: [],
          discount: 0,
          totalPrice: 150,
          currency: "USD",
        },
        payment: {
          method: "cash",
          status: "completed",
          paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        urgencyBadge: "scheduled",
        confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });
      bookings.push(booking1);

      // Create review for completed booking
      await Review.create({
        bookingId: booking1._id,
        reviewerId: customers[0]._id,
        revieweeId: technicians[0].user._id,
        reviewerType: "customer",
        overall: 5,
        punctuality: 5,
        quality: 5,
        communication: 5,
        professionalism: 5,
        title: "Excellent Service!",
        comment:
          "David was professional, punctual, and fixed the leak quickly. Highly recommend!",
        isVerified: true,
        status: "active",
      });

      console.log("✅ Completed booking created with review");

      // Active booking (in progress)
      const booking2 = await Booking.create({
        customerId: customers[1]._id,
        technicianId: technicians[1].user._id,
        bookingType: "precision",
        serviceType: "Electrical",
        title: "Light Fixture Installation",
        description:
          "Need to install 3 new light fixtures in the living room and bedroom.",
        date: new Date(),
        time: "02:00 PM",
        location: {
          address: "456 Oak Avenue, Los Angeles, CA 90001",
          coordinates: {
            latitude: 34.0522,
            longitude: -118.2437,
          },
          city: "Los Angeles",
          state: "CA",
          zipCode: "90001",
          doorNotes: "House with blue door",
        },
        status: "in_progress",
        pricing: {
          basePrice: 200,
          distanceFee: 10,
          urgencyFee: 0,
          additionalCharges: [],
          discount: 0,
          totalPrice: 210,
          currency: "USD",
        },
        payment: {
          method: "upi",
          status: "pending",
        },
        urgencyBadge: "today",
        confirmedAt: new Date(),
        startedAt: new Date(),
      });
      bookings.push(booking2);
      console.log("✅ Active booking created");

      // Pending booking (waiting for acceptance)
      const booking3 = await Booking.create({
        customerId: customers[2]._id,
        technicianId: technicians[2].user._id,
        bookingType: "precision",
        serviceType: "AC Repair",
        title: "AC Not Cooling Properly",
        description:
          "The air conditioner is running but not cooling the room effectively.",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: "11:00 AM",
        location: {
          address: "789 Pine Road, Chicago, IL 60601",
          coordinates: {
            latitude: 41.8781,
            longitude: -87.6298,
          },
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          doorNotes: "Call when you arrive",
        },
        status: "pending",
        pricing: {
          basePrice: 180,
          distanceFee: 5,
          urgencyFee: 0,
          additionalCharges: [],
          discount: 0,
          totalPrice: 185,
          currency: "USD",
        },
        payment: {
          method: "cash",
          status: "pending",
        },
        urgencyBadge: "scheduled",
      });
      bookings.push(booking3);
      console.log("✅ Pending booking created");

      // Broadcast booking (waiting for acceptance)
      const booking4 = await Booking.create({
        customerId: customers[0]._id,
        bookingType: "broadcast",
        serviceType: "Plumbing",
        title: "Emergency - Burst Pipe in Basement",
        description:
          "A pipe has burst in the basement and water is flooding. Need immediate help!",
        date: new Date(),
        time: "ASAP",
        location: {
          address: "123 Main Street, New York, NY 10001",
          coordinates: {
            latitude: 40.7489,
            longitude: -73.968,
          },
          city: "New York",
          state: "NY",
          zipCode: "10001",
        },
        status: "pending",
        broadcastRequest: {
          isActive: true,
          sentTo: [
            {
              technicianId: technicians[0].user._id,
              sentAt: new Date(),
              viewed: true,
              viewedAt: new Date(),
              status: "pending",
            },
            {
              technicianId: technicians[4].user._id,
              sentAt: new Date(),
              viewed: false,
              status: "pending",
            },
          ],
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
        pricing: {
          basePrice: 200,
          distanceFee: 0,
          urgencyFee: 100,
          additionalCharges: [],
          discount: 0,
          totalPrice: 300,
          currency: "USD",
        },
        payment: {
          method: "cash",
          status: "pending",
        },
        isEmergency: true,
        urgencyBadge: "now",
        priority: "urgent",
      });
      bookings.push(booking4);
      console.log("✅ Broadcast booking created");
    }

    // Create sample notifications
    console.log("\n🔔 Creating sample notifications...");

    if (technicians.length > 0 && bookings.length > 0) {
      await Notification.create({
        userId: customers[0]._id,
        type: "success",
        title: "Booking Completed",
        message: "Your plumbing service has been completed successfully!",
        isRead: false,
        relatedId: booking1._id,
        relatedModel: "Booking",
      });

      await Notification.create({
        userId: technicians[0].user._id,
        type: "info",
        title: "New Booking Request",
        message: "You have a new emergency booking request from John Smith",
        isRead: false,
        relatedId: booking4._id,
        relatedModel: "Booking",
      });

      console.log("✅ Notifications created");
    } else {
      console.log("ℹ️  Skipping sample notifications (no bookings available)");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   👑 Admin: 1`);
    console.log(`   👥 Customers: ${customers.length}`);
    console.log(
      `   🔧 Technicians: ${technicians.length} (sign up through app)`,
    );
    console.log(`   📅 Bookings: ${bookings.length}`);
    console.log(`   ⭐ Reviews: ${bookings.length > 0 ? 1 : 0}`);
    console.log(`   🔔 Notifications: ${bookings.length > 0 ? 2 : 0}`);

    console.log("\n🔑 Login Credentials:");
    console.log("\n   Admin:");
    console.log(`   Email: ${sampleUsers.admin.email}`);
    console.log(`   Password: Admin123!`);

    console.log("\n   Sample Customer:");
    console.log(`   Email: ${sampleUsers.customers[0].email}`);
    console.log(`   Password: Customer123!`);

    console.log("\n💡 Tips:");
    console.log("   - All users have verified email addresses");
    console.log("   - Technicians should sign up through the application");
    console.log("   - Only verified technicians with services will be visible");
    console.log("   - Admin can verify technicians from the admin dashboard");

    console.log(
      "\n✅ You can now start the application and test all features!",
    );
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
};

// Run the seed
const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
};

// Execute if run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedDatabase };
