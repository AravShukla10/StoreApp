const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private (e.g., only authenticated users can create bookings)
router.post('/', bookingController.createBooking);

// @route   GET api/bookings
// @desc    Get all bookings (can be filtered by userId, shopId, status)
// @access  Private (e.g., for admin or specific user/shop)
router.get('/', bookingController.getAllBookings);

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private (e.g., for admin or the user/shop involved in the booking)
router.get('/:id', bookingController.getBookingById);

// @route   PUT api/bookings/:id/status
// @desc    Update booking status or completion
// @access  Private (e.g., shop owner or admin)
router.put('/:id/status', bookingController.updateBookingStatus);

// @route   DELETE api/bookings/:id
// @desc    Delete a booking
// @access  Private (e.g., for admin or the user/shop who created/received the booking)
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;