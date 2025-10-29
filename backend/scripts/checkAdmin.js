const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const admin = await User.findOne({ userType: 'admin' })
      .select('email firstName lastName isVerified isActive');
    
    if (admin) {
      console.log('✅ Admin Account Found:');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.firstName, admin.lastName);
      console.log('   Verified:', admin.isVerified ? 'Yes' : 'No');
      console.log('   Active:', admin.isActive ? 'Yes' : 'No');
      console.log('\n   Password: Admin123! (from seed data)');
    } else {
      console.log('❌ No admin account found in database');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
