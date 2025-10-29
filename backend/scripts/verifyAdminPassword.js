const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const testPassword = 'Admin123!';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    const admin = await User.findOne({ userType: 'admin' });
    
    if (!admin) {
      console.log('❌ No admin account found');
      process.exit(1);
    }
    
    console.log('✅ Admin Account Found:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.firstName, admin.lastName);
    console.log('   User Type:', admin.userType);
    console.log('   Verified:', admin.isVerified);
    console.log('   Active:', admin.isActive);
    console.log('\nTesting password:', testPassword);
    
    // Test password
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    if (isMatch) {
      console.log('✅ Password matches!');
      console.log('\n📝 Use these credentials:');
      console.log('   Email:', admin.email);
      console.log('   Password:', testPassword);
    } else {
      console.log('❌ Password does NOT match');
      console.log('\n🔧 Resetting password to:', testPassword);
      
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      await User.updateOne(
        { _id: admin._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('✅ Password reset successfully!');
      console.log('\n📝 New credentials:');
      console.log('   Email:', admin.email);
      console.log('   Password:', testPassword);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
