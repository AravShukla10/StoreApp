const Booking = require('../models/Booking');
const Item = require('../models/Item');
const Shop = require('../models/Shop');
const User = require('../models/User');

// This function now creates a SINGLE booking with MULTIPLE items
exports.createBooking = async (req, res) => {
  const { userId, shopId, items, notes } = req.body;

  try {
    // --- Validation ---
    if (!userId || !shopId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Missing required booking information.' });
    }

    const userExists = await User.findById(userId);
    if (!userExists) return res.status(404).json({ msg: 'User not found' });

    const shopExists = await Shop.findById(shopId);
    if (!shopExists) return res.status(404).json({ msg: 'Shop not found' });

    let totalAmount = 0;
    const itemsForBooking = [];

    // --- Process and Validate Each Item ---
    for (const item of items) {
      const dbItem = await Item.findById(item.itemId);
      if (!dbItem) {
        return res.status(404).json({ msg: `Item with ID ${item.itemId} not found.` });
      }
      if (dbItem.shopId.toString() !== shopId) {
          return res.status(400).json({ msg: `Item ${dbItem.name} does not belong to the specified shop.` });
      }

      const price = dbItem.price_per_quantity;
      totalAmount += price * item.quantity;
      itemsForBooking.push({
        itemId: item.itemId,
        quantity: item.quantity,
        price: price // Store price at time of booking
      });
    }

    // --- Create the Single Booking ---
    const newBooking = new Booking({
      userId,
      shopId,
      items: itemsForBooking,
      totalAmount,
      notes,
    });

    const booking = await newBooking.save();

    // Optionally, add the booking reference to the user document
    userExists.bookings.push(booking._id);
    await userExists.save();

    res.status(201).json(booking);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// --- OTHER BOOKING FUNCTIONS (getAllBookings, etc.) ---
// These remain largely the same, but the populate path for items will need to be updated.

exports.getAllBookings = async (req, res) => {
  try {
    const { userId, shopId, status } = req.query;
    let query = {};
    if (userId) query.userId = userId;
    if (shopId) query.shopId = shopId;
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('userId', 'name phone')
      .populate('shopId', 'name phone')
      // Correctly populate the itemId within the items array
      .populate('items.itemId', 'name');

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
// ... (getBookingById, updateBookingStatus, deleteBooking - update populate path in getBookingById as well)
exports.getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('userId', 'name phone')
        .populate('shopId', 'name phone')
        .populate('items.itemId', 'name');

      if (!booking) {
        return res.status(404).json({ msg: 'Booking not found' });
      }
      res.json(booking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
};

exports.updateBookingStatus = async (req, res) => {
    // ... logic is the same
    const { status, isCompleted } = req.body;
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
          return res.status(404).json({ msg: 'Booking not found' });
        }
        if (status) booking.status = status;
        if (typeof isCompleted === 'boolean') booking.isCompleted = isCompleted;
        if (status === 'completed') booking.isCompleted = true; // Convenience
        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteBooking = async (req, res) => {
    // ... logic is the same
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