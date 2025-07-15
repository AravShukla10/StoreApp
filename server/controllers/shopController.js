// controllers/shopController.js
const Shop = require('../models/Shop');
const bcrypt = require('bcryptjs');

// Register a new shop
exports.registerShop = async (req, res) => {
  const { name, phone, password } = req.body;
  try {
    let shop = await Shop.findOne({ phone });
    if (shop) {
      return res.status(400).json({ msg: 'Shop with this phone number already exists' });
    }

    shop = new Shop({
      name,
      phone,
      password,
    });

    // Password hashing is handled by the pre-save hook in the Shop model

    await shop.save();

    // In a real application, you might generate a JWT here for authentication
    res.status(201).json({ msg: 'Shop registered successfully', shop: { id: shop._id, name: shop.name, phone: shop.phone } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all shops
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().select('-password'); // Exclude password from results
    res.json(shops);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get shop by ID
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).select('-password');
    if (!shop) {
      return res.status(404).json({ msg: 'Shop not found' });
    }
    res.json(shop);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update shop information
exports.updateShop = async (req, res) => {
  const { name, phone, isOpen } = req.body; // Password updates should be handled separately for security
  const shopFields = {};
  if (name) shopFields.name = name;
  if (phone) shopFields.phone = phone;
  if (typeof isOpen === 'boolean') shopFields.isOpen = isOpen;

  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ msg: 'Shop not found' });
    }

    // Check if the new phone number is already taken by another shop
    if (phone && phone !== shop.phone) {
      const existingShop = await Shop.findOne({ phone });
      if (existingShop) {
        return res.status(400).json({ msg: 'Phone number already registered by another shop' });
      }
    }

    shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { $set: shopFields },
      { new: true }
    ).select('-password'); // Return the updated document

    res.json(shop);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a shop
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ msg: 'Shop not found' });
    }

    await Shop.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Shop removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Login shop (basic example, typically involves JWT)
exports.loginShop = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const shop = await Shop.findOne({ phone }).select('+password'); // Select password to compare
    if (!shop) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, shop.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // In a real application, generate and send a JWT
    res.json({ msg: 'Shop logged in successfully', shop: { id: shop._id, name: shop.name, phone: shop.phone } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};