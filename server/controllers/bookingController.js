const Booking = require('../models/Booking');
const Item = require('../models/Item');
const Shop = require('../models/Shop');
const User=require('../models/User');
// Create a new booking
exports.createBooking = async (req, res) => {
  // We no longer expect bookingTime from the request body
  const { userId, shopId, itemId, quantity, notes } = req.body; 

  try {
    // Basic validation: Check if User, Shop, and Item exist
    const userExists = await User.findById(userId); 
    const shopExists = await Shop.findById(shopId);
    const itemExists = await Item.findById(itemId);

    if (!userExists) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (!shopExists) {
      return res.status(404).json({ msg: 'Shop not found' });
    }
    if (!itemExists) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    const newBooking = new Booking({
      userId,
      shopId,
      itemId,
      quantity,
      bookingTime: new Date(), // Set bookingTime to the current server time
      notes,
    });

    const booking = await newBooking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all bookings (can be filtered, e.g., by user or shop)
exports.getAllBookings = async (req, res) => {
  try {
    const { userId, shopId, status } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (shopId) query.shopId = shopId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('userId', 'name phone') // Populate user details
      .populate('shopId', 'name phone') // Populate shop details
      .populate('itemId', 'name price'); // Populate item details

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name phone')
      .populate('shopId', 'name phone')
      .populate('itemId', 'name price');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update booking status (e.g., pending to confirmed/cancelled)
exports.updateBookingStatus = async (req, res) => {
  const { status, isCompleted } = req.body;

  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    if (status) booking.status = status;
    if (typeof isCompleted === 'boolean') booking.isCompleted = isCompleted;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Booking removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};