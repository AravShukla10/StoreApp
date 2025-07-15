// routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// @route   POST api/shops/register
// @desc    Register a new shop
// @access  Public
router.post('/register', shopController.registerShop);

// @route   POST api/shops/login
// @desc    Authenticate shop & get token
// @access  Public
router.post('/login', shopController.loginShop);

// @route   GET api/shops
// @desc    Get all shops
// @access  Public (you might want to restrict this later)
router.get('/', shopController.getAllShops);

// @route   GET api/shops/:id
// @desc    Get shop by ID
// @access  Public (you might want to restrict this later)
router.get('/:id', shopController.getShopById);

// @route   PUT api/shops/:id
// @desc    Update shop information
// @access  Private (e.g., only the shop itself or an admin)
router.put('/:id', shopController.updateShop);

// @route   DELETE api/shops/:id
// @desc    Delete a shop
// @access  Private (e.g., only the shop itself or an admin)
router.delete('/:id', shopController.deleteShop);

module.exports = router;