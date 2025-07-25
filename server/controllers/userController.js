// controllers/userController.js
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

// ----------------- helpers -----------------
const sendOtpForTesting = (phone, otp) => {
  console.log(`[TEST] OTP ${otp} -> ${phone}`);
};

const generateAndSaveOtp = async (user) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  user.otp = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save({ validateBeforeSave: false }); // Skip validation to save OTP without name
  sendOtpForTesting(user.phone, otp);
  return otp;
};

// -------------- AUTH FLOW - SIGNUP ------------------
exports.signup = async (req, res) => {
  const { phone, name } = req.body;

  if (!phone) return res.status(400).json({ message: 'Phone is required.' });
  if (!/^\d{10}$/.test(phone))
    return res.status(400).json({ message: 'Phone must be 10 digits.' });
  if (!name || !name.trim())
    return res.status(400).json({ message: 'Name is required for signup.' });

  try {
    let user = await User.findOne({ phone });
    if (user) {
      return res.status(409).json({ message: 'User with this phone number already exists. Please login instead.' });
    }

    user = new User({ name: name.trim(), phone });
    const otp = await generateAndSaveOtp(user);

    res.status(201).json({
      message: 'User created. OTP sent for verification.',
      otp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -------------- AUTH FLOW - LOGIN ------------------
exports.login = async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ message: 'Phone is required.' });
  if (!/^\d{10}$/.test(phone))
    return res.status(400).json({ message: 'Phone must be 10 digits.' });

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please signup.' });
    }

    const otp = await generateAndSaveOtp(user);

    res.status(200).json({
      message: 'OTP sent for login.',
      otp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ message: 'Phone and OTP are required.' });

  try {
    const user = await User.findOne({ phone }).select('+otp +otpExpiresAt');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.otp !== otp || user.otpExpiresAt < Date.now())
      return res.status(401).json({ message: 'Invalid / expired OTP.' });

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
     { id: user._id, phone: user.phone },
    process.env.JWT_SECRET,
     { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -------------- USER CRUD ------------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name.trim();
    await user.save();

    res.json({ message: 'User updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// -------------- CART ------------------
exports.getUserCart = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate({
        path: 'cart.itemId',
        model: 'Item'
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.addItemToCart = async (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId) return res.status(400).json({ message: 'itemId is required.' });

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const existingIndex = user.cart.findIndex(
      (ci) => ci.itemId.toString() === itemId.toString()
    );

    if (existingIndex > -1) {
        user.cart[existingIndex].quantity += quantity;
        if (user.cart[existingIndex].quantity <= 0) {
            user.cart.splice(existingIndex, 1);
        }
    } else if (quantity > 0) {
        user.cart.push({ itemId, quantity });
    }

    await user.save();
    const populatedUser = await User.findById(req.params.id).populate('cart.itemId');
    res.json({ message: 'Cart updated', cart: populatedUser.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.clearUserCart = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      user.cart = [];
      await user.save();

      res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (err) {
      console.error('Error clearing cart:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// -------------- BOOKINGS ------------------
exports.getUserBookings = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('bookings');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// -------------- FETCH BY PHONE ------------------
exports.getUserByPhone = async (req, res) => {
  const { phone } = req.params;

  if (!/^\d{10}$/.test(phone))
    return res.status(400).json({ message: 'Phone must be 10 digits.' });

  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found.' });
       const token = jwt.sign(
     { id: user._id, phone: user.phone },
    process.env.JWT_SECRET,
     { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'User found and token generated',
      userId: user._id,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -------------- PUSH NOTIFICATIONS (NEW FUNCTION) ------------------
exports.savePushToken = async (req, res) => {
  const { id } = req.params;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Push token is required.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.pushToken = token;
    await user.save();

    res.status(200).json({ message: 'Push token saved successfully.' });
  } catch (err) {
    console.error('Error saving push token:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};