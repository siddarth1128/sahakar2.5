const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCustomerStats,
  getCustomerDashboard,
  getCustomerHistory,
  getFavoriteTechnicians,
  getCustomerAnalytics,
} = require('../controllers/customerController');

// All routes are protected and require customer role
router.use(protect);
router.use(authorize('customer'));

// Dashboard
router.get('/dashboard', getCustomerDashboard);
router.get('/stats', getCustomerStats);

// History
router.get('/history', getCustomerHistory);

// Favorites
router.get('/favorites', getFavoriteTechnicians);

// Analytics
router.get('/analytics', getCustomerAnalytics);

module.exports = router;
