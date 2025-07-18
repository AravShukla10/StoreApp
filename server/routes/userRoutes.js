// routes/userRoutes.js
const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  verifyOtpAndLogin,
  getUserById,
  updateUser,
  getUserCart,
  addItemToCart,
  clearUserCart, // Added for clearing the cart
  getUserBookings,
  getUserByPhone
} = require('../controllers/userController');

// ---------- Auth ----------
router.post('/auth/signup', signup);
router.post('/auth/login', login);
router.post('/auth/verify-otp', verifyOtpAndLogin);

// ---------- User profile ----------
router.get('/:id', getUserById);
router.put('/:id', updateUser);

// ---------- Cart ----------
router.get('/:id/cart', getUserCart);
router.post('/:id/cart', addItemToCart);
router.delete('/:id/cart', clearUserCart); // Route to clear the cart

// ---------- Bookings ----------
router.get('/:id/bookings', getUserBookings);

// ---------- Lookup by phone ----------
router.get('/phone/:phone', getUserByPhone);

module.exports = router;