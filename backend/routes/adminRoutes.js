const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/roleCheck');
const {
  getAllUsers,
  getAllPayments,
  getUserPayments,
  searchPayments
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Admin routes
router.get('/users', getAllUsers);
router.get('/payments', getAllPayments);
router.get('/users/:userId/payments', getUserPayments);
router.get('/payments/search', searchPayments);

module.exports = router;
