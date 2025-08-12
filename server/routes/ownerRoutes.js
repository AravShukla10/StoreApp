const express = require('express');
const router = express.Router();
const { registerOwner, loginOwner, getShopOrders, addItemToShop } = require('../controllers/ownerController');
// Use your existing middleware here
const { authMiddleware } = require('../middleware/auth'); 

// Public routes
router.post('/register', registerOwner);
router.post('/login', loginOwner);

// Protected routes
router.get('/my-shop/orders', authMiddleware, getShopOrders);
router.post('/my-shop/items', authMiddleware, addItemToShop);

module.exports = router;