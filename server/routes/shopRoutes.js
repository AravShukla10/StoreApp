// routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { authMiddleware } = require('../middleware/auth'); // Import your auth middleware

// --- PUBLIC ROUTES ---
// These routes are for customers browsing shops.

// @route   GET api/shops
// @desc    Get all open shops
// @access  Public
router.get('/', shopController.getAllShops);

// @route   GET api/shops/:id
// @desc    Get a single shop's public profile and its items
// @access  Public
router.get('/:id', shopController.getShopById);


// --- PROTECTED OWNER ROUTE ---
// This route is for the shop owner to manage their shop details.

// @route   PUT api/shops/:id
// @desc    Update shop information (e.g., name, isOpen status)
// @access  Private (Owner only)
router.put('/:id', authMiddleware, shopController.updateShop);


/*
  NOTE: The following routes have been removed:
  - POST /register -> Replaced by the '/api/owners/register' route.
  - POST /login    -> Replaced by the '/api/owners/login' route.
  - DELETE /:id    -> This is now considered a super-admin action and has been removed for now.
*/

module.exports = router;
