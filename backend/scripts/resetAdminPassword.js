const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const newPassword = 'Admin123!';

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
    console.log('   Has Password:', admin.password ? 'Yes' : 'No (PROBLEM!)');
    
    // Hash new password
    console.log('\n🔧 Setting password to:', newPassword);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update using updateOne to avoid pre-save hooks
    await User.updateOne(
      { _id: admin._id },
      { 
        $set: { 
          password: hashedPassword,
          isVerified: true,
          isActive: true
        } 
      }
    );
    
    console.log('✅ Password reset successfully!');
    
    // Verify the update
    const updatedAdmin = await User.findById(admin._id);
    const testMatch = await bcrypt.compare(newPassword, updatedAdmin.password);
    
    if (testMatch) {
      console.log('✅ Password verified successfully!');
    } else {
      console.log('❌ Password verification failed');
    }
    
    console.log('\n📝 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', admin.email);
    console.log('Password:', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nLogin URL: http://localhost:3000/admin/login');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
