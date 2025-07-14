// controllers/userController.js
const User = require('../models/User'); // Adjust path as needed
const otpGenerator = require('otp-generator'); // npm install otp-generator

// Helper function to "send" OTP (for testing purposes - just logs)
const sendOtpForTesting = (phone, otp) => {
    console.log(`[TESTING ONLY] Simulating OTP send: OTP ${otp} for phone ${phone}`);
    // In a real application, this would be your SMS or email sending logic.
    // For testing, we just log it.
};

// @desc    Register a new user / Send OTP for login
// @route   POST /api/users/signup-login
// @access  Public
exports.signupOrLogin = async (req, res) => {
    const { phone } = req.body;

    // Basic phone number validation
    if (!phone) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }

    try {
        let user = await User.findOne({ phone });
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        if (user) {
            // User exists, update OTP and expiration
            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();
            sendOtpForTesting(phone, otp); // Log the OTP for testing
            res.status(200).json({ message: 'OTP generated and saved for existing user.', otp: otp }); // Return OTP for testing
        } else {
            // New user, create and save
            user = new User({ phone, otp, otpExpiresAt });
            await user.save();
            sendOtpForTesting(phone, otp); // Log the OTP for testing
            res.status(201).json({ message: 'New user registered. OTP generated and saved for verification.', otp: otp }); // Return OTP for testing
        }
    } catch (error) {
        console.error('Error in signupOrLogin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify OTP and log in user
// @route   POST /api/users/verify-otp
// @access  Public
exports.verifyOtpAndLogin = async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required.' });
    }

    try {
        const user = await User.findOne({ phone });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is valid, clear OTP fields
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        // In a real application, you would generate a JWT token here
        // and send it back to the client for subsequent authenticated requests.
        // For simplicity, we'll just send the user ID.
        res.status(200).json({
            message: 'Login successful.',
            userId: user._id,
            // token: 'YOUR_JWT_TOKEN_HERE' // Example for JWT
        });

    } catch (error) {
        console.error('Error in verifyOtpAndLogin:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Fetch user details by ID
// @route   GET /api/users/:id
// @access  Private (usually requires authentication)
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-otp -otpExpiresAt'); // Exclude sensitive OTP fields

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error in getUserById:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user details (example)
// @route   PUT /api/users/:id
// @access  Private (requires authentication)
exports.updateUser = async (req, res) => {
    const { name } = req.body; // You can add other updatable fields

    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields
        if (name) user.name = name;
        // if (req.body.someOtherField) user.someOtherField = req.body.someOtherField;

        await user.save();
        res.status(200).json({ message: 'User updated successfully.', user });

    } catch (error) {
        console.error('Error in updateUser:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's cart (example)
// @route   GET /api/users/:id/cart
// @access  Private (requires authentication)
exports.getUserCart = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('cart.itemId'); // Populate item details in cart

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user.cart);
    } catch (error) {
        console.error('Error in getUserCart:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add item to user's cart (example)
// @route   POST /api/users/:id/cart
// @access  Private (requires authentication)
exports.addItemToCart = async (req, res) => {
    const { itemId, quantity } = req.body;

    if (!itemId || !quantity) {
        return res.status(400).json({ message: 'itemId and quantity are required.' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if item already exists in cart
        const existingCartItem = user.cart.find(item => item.itemId.toString() === itemId);

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            user.cart.push({ itemId, quantity });
        }

        await user.save();
        res.status(200).json({ message: 'Item added to cart successfully.', cart: user.cart });

    } catch (error) {
        console.error('Error in addItemToCart:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID or Item ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's bookings (example)
// @route   GET /api/users/:id/bookings
// @access  Private (requires authentication)
exports.getUserBookings = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('bookings'); // Populate booking details

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user.bookings);
    } catch (error) {
        console.error('Error in getUserBookings:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};