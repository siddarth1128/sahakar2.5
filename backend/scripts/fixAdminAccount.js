const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const adminEmail = 'admin@fixitnow.com';
const adminPassword = 'Admin123!';

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Find or create admin
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ Admin not found. Creating new admin account...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create admin
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        userType: 'admin',
        isVerified: true,
        isActive: true,
        phone: '+91 9999999999'
      });
      
      console.log('✅ Admin account created!');
    } else {
      console.log('✅ Admin account found. Updating password...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Update directly with updateOne to avoid pre-save hooks
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
      
      console.log('✅ Password updated!');
    }
    
    // Fetch fresh data
    admin = await User.findOne({ email: adminEmail });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ADMIN ACCOUNT READY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📧 Email:', admin.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', admin.firstName, admin.lastName);
    console.log('✓ Verified:', admin.isVerified);
    console.log('✓ Active:', admin.isActive);
    console.log('✓ User Type:', admin.userType);
    console.log('\n🌐 Login URL: http://localhost:3000/admin/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
