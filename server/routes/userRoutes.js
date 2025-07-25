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
  getUserByPhone,
  savePushToken, // 1. Import the new controller function
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

// ---------- PUSH NOTIFICATIONS (NEW ROUTE) ----------
// 2. Add the route to save the user's push notification token
router.post('/:id/save-push-token', savePushToken);

module.exports = router;