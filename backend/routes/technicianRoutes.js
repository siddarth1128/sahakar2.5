const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTechnicianDashboard,
  getPendingRequests,
  acceptJobRequest,
  rejectJobRequest,
  getActiveJobs,
  getUpcomingJobs,
  updateJobStatus,
  completeJob,
  getEarningsWeek,
  getEarningsMonth,
  updateAvailability,
  uploadJobPhotos,
  getTechnicianStats,
  getJobDetails,
  rescheduleJob,
  cancelJob,
} = require('../controllers/technicianController');

// All routes are protected and require technician role
router.use(protect);
router.use(authorize('technician'));

// Dashboard
router.get('/dashboard', getTechnicianDashboard);
router.get('/stats', getTechnicianStats);

// Job Requests
router.get('/requests/pending', getPendingRequests);
router.post('/requests/:id/accept', acceptJobRequest);
router.post('/requests/:id/reject', rejectJobRequest);

// Jobs Management
router.get('/jobs/active', getActiveJobs);
router.get('/jobs/upcoming', getUpcomingJobs);
router.get('/jobs/:id', getJobDetails);
router.put('/jobs/:id/status', updateJobStatus);
router.post('/jobs/:id/complete', completeJob);
router.put('/jobs/:id/reschedule', rescheduleJob);
router.put('/jobs/:id/cancel', cancelJob);

// Photo Upload
router.post('/jobs/:id/photos', uploadJobPhotos);

// Earnings
router.get('/earnings/week', getEarningsWeek);
router.get('/earnings/month', getEarningsMonth);

// Availability
router.put('/availability', updateAvailability);

module.exports = router;
