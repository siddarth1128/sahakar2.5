const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function updateExistingTechnicians() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('🔌 Connected to MongoDB');

        // Find all technicians without technicianDetails
        const technicians = await User.find({
            userType: 'technician',
            $or: [
                { technicianDetails: { $exists: false } },
                { technicianDetails: null }
            ]
        });

        console.log(`📊 Found ${technicians.length} technicians needing technicianDetails`);

        const defaultTechnicianDetails = {
            services: [],
            experience: '',
            rating: 0,
            totalReviews: 0,
            hourlyRate: 0,
            availability: 'available',
            bio: '',
            certifications: [],
            completedJobs: 0,
        };

        // Update each technician
        let updatedCount = 0;
        for (const tech of technicians) {
            tech.technicianDetails = defaultTechnicianDetails;
            await tech.save();
            updatedCount++;
            console.log(`✅ Updated technician: ${tech.firstName} ${tech.lastName}`);
        }

        console.log(`🎉 Successfully updated ${updatedCount} technicians with technicianDetails`);

        // Verify technicians are now visible
        const visibleTechnicians = await User.countDocuments({
            userType: 'technician',
            isActive: true,
        });

        console.log(`👥 Total active technicians in system: ${visibleTechnicians}`);

    } catch (error) {
        console.error('❌ Error updating technicians:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
updateExistingTechnicians().catch(console.error);
