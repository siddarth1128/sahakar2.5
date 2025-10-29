const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Admin user details
const adminUser = {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@fixitnow.com',
    password: 'Admin123!', // Will be hashed
    userType: 'admin',
    secretKey: 'ADMIN_SECRET_2024', // Secret key for password reset
    isVerified: true,
    isActive: true,
};

async function createAdminUser() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('🔌 Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            email: adminUser.email,
            userType: 'admin'
        });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            console.log('📧 Email:', existingAdmin.email);
            console.log('🔑 Secret Key:', existingAdmin.secretKey);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        // Create admin user
        const admin = new User({
            ...adminUser,
            password: hashedPassword,
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', adminUser.email);
        console.log('🔑 Password:', adminUser.password);
        console.log('🗝️  Secret Key:', adminUser.secretKey);
        console.log('\n🚀 You can now login at: http://localhost:3000/admin/login');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
createAdminUser().catch(console.error);
