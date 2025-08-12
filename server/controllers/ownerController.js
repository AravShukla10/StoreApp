// controllers/ownerController.js
const Owner = require('../models/Owner');
const Shop = require('../models/Shop');
const Item = require('../models/Item');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

// Ensure Cloudinary is configured (you should have this in your itemController already)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// --- AUTHENTICATION ---

/**
 * @desc    Register a new Owner and create their Shop
 * @route   POST /api/owners/register
 */
exports.registerOwner = async (req, res) => {
    // --- NEW: Destructure expoPushToken from the request body ---
    const { ownerName, ownerPhone, password, shopName, shopPhone, expoPushToken } = req.body;

    if (!ownerName || !ownerPhone || !password || !shopName || !shopPhone) {
        return res.status(400).json({ message: 'Please provide all required fields for owner and shop.' });
    }

    try {
        const ownerExists = await Owner.findOne({ phone: ownerPhone });
        if (ownerExists) {
            return res.status(409).json({ message: 'An owner with this phone number already exists.' });
        }

        const shopExists = await Shop.findOne({ phone: shopPhone });
        if (shopExists) {
            return res.status(409).json({ message: 'A shop with this phone number already exists.' });
        }

        const newShop = new Shop({
            name: shopName,
            phone: shopPhone,
        });
        const savedShop = await newShop.save();

        const newOwner = new Owner({
            name: ownerName,
            phone: ownerPhone,
            password: password,
            shop: savedShop._id,
            // --- NEW: Save the push token during registration ---
            expoPushToken: expoPushToken,
        });
        const savedOwner = await newOwner.save();
        
        savedShop.owner = savedOwner._id;
        await savedShop.save();

        res.status(201).json({
            message: 'Owner and shop registered successfully!',
            ownerId: savedOwner._id,
            shopId: savedShop._id,
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};


/**
 * @desc    Login for an Owner and save their push token
 * @route   POST /api/owners/login
 */
exports.loginOwner = async (req, res) => {
    const { phone, password, expoPushToken } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ message: 'Please provide phone and password.' });
    }

    try {
        const owner = await Owner.findOne({ phone }).select('+password');
        if (!owner) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await owner.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        if (expoPushToken) {
            owner.expoPushToken = expoPushToken;
            await owner.save();
        }

        const payload = { id: owner._id, shopId: owner.shop, name: owner.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            owner: { id: owner._id, name: owner.name, shopId: owner.shop }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};



// --- SHOP MANAGEMENT ---

/**
 * @desc    Get all orders for the logged-in owner's shop
 * @route   GET /api/owners/my-shop/orders
 * @access  Protected
 */
exports.getShopOrders = async (req, res) => {
    // The owner's shopId is attached to the req object by the auth middleware
    const shopId = req.user.shopId; 

    try {
        const bookings = await Booking.find({ shopId: shopId })
            .populate('userId', 'name phone') // Get customer details
            .populate('items.itemId', 'name price_per_quantity') // Get item details
            .sort({ createdAt: -1 }); // Show newest orders first

        if (!bookings) {
            return res.status(404).json({ message: 'No orders found for this shop.' });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching shop orders:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Add a new item to the logged-in owner's shop
 * @route   POST /api/owners/my-shop/items
 * @access  Protected
 */
exports.addItemToShop = async (req, res) => {
    const shopId = req.user.shopId; // From auth middleware
    const { name, quantity_avl, price_per_quantity, category, subcategory, imageUrl } = req.body;
    const imageFile = req.body.imageFile; // For base64 upload

    // --- Validation ---
    if (!name || !price_per_quantity || !category || !subcategory) {
        return res.status(400).json({ message: 'Name, price, category, and subcategory are required.' });
    }
    if (!imageUrl && !imageFile) {
        return res.status(400).json({ message: 'You must provide either an image URL or upload an image file.' });
    }
    
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) return res.status(404).json({ message: "Owner's shop not found." });

        const categoryExists = await Category.findById(category);
        if (!categoryExists) return res.status(404).json({ message: 'Category not found.' });
        
        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) return res.status(404).json({ message: 'Subcategory not found.' });

        let finalImageUrl = imageUrl;
        let finalImagePublicId = null;

        // --- Image Handling ---
        // If a file is uploaded (e.g., as a base64 string), upload it to Cloudinary
        if (imageFile) {
            try {
                const uploadResult = await cloudinary.uploader.upload(imageFile, {
                    folder: 'item_images'
                });
                finalImageUrl = uploadResult.secure_url;
                finalImagePublicId = uploadResult.public_id;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                return res.status(500).json({ message: 'Image upload failed.', error: uploadError.message });
            }
        }
        
        // --- Create and Save Item ---
        const newItem = new Item({
            name,
            quantity_avl: quantity_avl || 0,
            price_per_quantity,
            shopId: shopId, // Set to the owner's shop
            imageUrl: finalImageUrl,
            imagePublicId: finalImagePublicId,
            category,
            subcategory,
        });

        const savedItem = await newItem.save();

        // Add the new item's reference to the shop's items array
        shop.items.push(savedItem._id);
        await shop.save();

        res.status(201).json(savedItem);

    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
