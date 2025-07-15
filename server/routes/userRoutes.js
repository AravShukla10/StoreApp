const express = require('express');
const router = express.Router();

const {
  signupOrLogin,
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
router.post('/auth/send-otp', signupOrLogin);     // send / resend OTP
router.post('/auth/verify-otp', verifyOtpAndLogin);

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
