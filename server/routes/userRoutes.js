const express = require('express');
const router = express.Router();

const {
  signup, // Changed from signupOrLogin
  login,  // New login function
  verifyOtpAndLogin,
  getUserById,
  updateUser,
  getUserCart,
  addItemToCart,
  getUserBookings,
  getUserByPhone
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// ---------- Auth ----------
router.post('/auth/signup', signup);     // Signup route
router.post('/auth/login', login);       // Login route
router.post('/auth/verify-otp', verifyOtpAndLogin); // Verify OTP for both signup and login

// ---------- User profile ----------
router.get('/:id', getUserById);
router.put('/:id', updateUser);

// ---------- Cart ----------
router.get('/:id/cart', getUserCart);
router.post('/:id/cart', addItemToCart);

// ---------- Bookings ----------
router.get('/:id/bookings', getUserBookings);

// ---------- Lookup by phone ----------
router.get('/phone/:phone', getUserByPhone); 

module.exports = router;
