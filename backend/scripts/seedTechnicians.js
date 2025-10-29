const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const techniciansData = [
  {
    firstName: 'Ravi',
    lastName: 'Kumar',
    email: 'ravi.kumar@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543210',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Ravi+Kumar&background=667eea&color=fff',
    address: {
      street: '123 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Plumbing', 'Electrical', 'AC Repair'],
      experience: '5 years',
      rating: 4.8,
      totalReviews: 127,
      hourlyRate: 500,
      availability: 'available',
      bio: 'Expert plumber and electrician with 5 years of experience. Quick response time and quality work guaranteed.',
      certifications: ['Licensed Plumber', 'Electrical Safety Certificate'],
      completedJobs: 245,
    },
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543211',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=764ba2&color=fff',
    address: {
      street: '456 Ring Road',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
    },
    technicianDetails: {
      services: ['AC Repair', 'Refrigerator Repair', 'Washing Machine'],
      experience: '7 years',
      rating: 4.9,
      totalReviews: 189,
      hourlyRate: 600,
      availability: 'available',
      bio: 'Specialized in AC and appliance repairs. Available for emergency services.',
      certifications: ['HVAC Certified', 'Appliance Repair Specialist'],
      completedJobs: 312,
    },
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543212',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=10b981&color=fff',
    address: {
      street: '789 Station Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Electrical', 'Wiring', 'Smart Home Installation'],
      experience: '4 years',
      rating: 4.7,
      totalReviews: 98,
      hourlyRate: 550,
      availability: 'available',
      bio: 'Licensed electrician specializing in residential and commercial wiring. Smart home expert.',
      certifications: ['Licensed Electrician', 'Smart Home Certified'],
      completedJobs: 178,
    },
  },
  {
    firstName: 'Sneha',
    lastName: 'Reddy',
    email: 'sneha.reddy@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543213',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=f59e0b&color=fff',
    address: {
      street: '321 Lake View',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Plumbing', 'Bathroom Fitting', 'Water Heater'],
      experience: '6 years',
      rating: 4.85,
      totalReviews: 156,
      hourlyRate: 520,
      availability: 'available',
      bio: 'Professional plumber with expertise in bathroom fittings and water heater installations.',
      certifications: ['Certified Plumber', 'Gas Line Installation'],
      completedJobs: 267,
    },
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'vikram.singh@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543214',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=3b82f6&color=fff',
    address: {
      street: '654 Park Street',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Carpentry', 'Furniture Repair', 'Door Installation'],
      experience: '8 years',
      rating: 4.75,
      totalReviews: 143,
      hourlyRate: 480,
      availability: 'available',
      bio: 'Experienced carpenter for furniture repair, door fitting, and custom woodwork.',
      certifications: ['Master Carpenter', 'Furniture Design Certificate'],
      completedJobs: 289,
    },
  },
  {
    firstName: 'Anjali',
    lastName: 'Mehta',
    email: 'anjali.mehta@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543215',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Anjali+Mehta&background=ef4444&color=fff',
    address: {
      street: '987 Beach Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Painting', 'Wall Repair', 'Interior Design'],
      experience: '5 years',
      rating: 4.65,
      totalReviews: 87,
      hourlyRate: 450,
      availability: 'available',
      bio: 'Professional painter with expertise in interior and exterior painting, wall repairs.',
      certifications: ['Professional Painter', 'Interior Design Basics'],
      completedJobs: 198,
    },
  },
  {
    firstName: 'Rajesh',
    lastName: 'Nair',
    email: 'rajesh.nair@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543216',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Nair&background=8b5cf6&color=fff',
    address: {
      street: '147 Hill View',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Electrical', 'Plumbing', 'General Maintenance'],
      experience: '10 years',
      rating: 4.95,
      totalReviews: 234,
      hourlyRate: 650,
      availability: 'available',
      bio: 'All-rounder technician with 10 years experience. Can handle electrical, plumbing, and general repairs.',
      certifications: ['Multi-skilled Technician', 'Safety Expert'],
      completedJobs: 456,
    },
  },
  {
    firstName: 'Kavita',
    lastName: 'Desai',
    email: 'kavita.desai@fixitnow.com',
    password: 'password123',
    phone: '+91-9876543217',
    userType: 'technician',
    isVerified: true,
    isActive: true,
    avatar: 'https://ui-avatars.com/api/?name=Kavita+Desai&background=ec4899&color=fff',
    address: {
      street: '258 Garden Colony',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380001',
      country: 'India',
    },
    technicianDetails: {
      services: ['Cleaning', 'Deep Cleaning', 'Pest Control'],
      experience: '3 years',
      rating: 4.6,
      totalReviews: 76,
      hourlyRate: 400,
      availability: 'available',
      bio: 'Professional cleaning and pest control services. Thorough and reliable.',
      certifications: ['Cleaning Professional', 'Pest Control License'],
      completedJobs: 145,
    },
  },
];

const seedTechnicians = async () => {
  try {
    console.log('🌱 Starting technician seeding...');

    // Clear existing technicians
    await User.deleteMany({ userType: 'technician' });
    console.log('🗑️  Cleared existing technicians');

    // Hash passwords and create technicians
    for (const techData of techniciansData) {
      const salt = await bcrypt.genSalt(10);
      techData.password = await bcrypt.hash(techData.password, salt);

      const technician = await User.create(techData);
      console.log(`✅ Created technician: ${technician.firstName} ${technician.lastName}`);
    }

    console.log('\n🎉 Successfully seeded technicians!');
    console.log(`📊 Total technicians created: ${techniciansData.length}`);
    console.log('\n📝 Login credentials:');
    console.log('Email: ravi.kumar@fixitnow.com');
    console.log('Password: password123');
    console.log('\n(All technicians use password: password123)');
  } catch (error) {
    console.error('❌ Error seeding technicians:', error);
    throw error;
  }
};

const run = async () => {
  try {
    await connectDB();
    await seedTechnicians();
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

run();
