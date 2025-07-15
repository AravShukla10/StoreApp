// routes/itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Route to add a new item
router.post('/', itemController.addItem);

// Route to remove an item by ID
router.delete('/:id', itemController.removeItem);

// Route to update an item by ID (name, type, quantity_avl, imageUrl, imagePublicId)
router.put('/:id', itemController.updateItem);

// Route to update an item's quantity by ID
router.patch('/:id/quantity', itemController.updateItemQuantity);

// Route to get all items for a specific shop
router.get('/shop/:shopId', itemController.getItemsByShop);

// --- New Image Specific Routes ---

// Route to upload/update an item's image
// This route expects imageUrl and imagePublicId in the request body
router.post('/:id/image', itemController.uploadItemImage);

// Route to delete an item's image
router.delete('/:id/image', itemController.deleteItemImage);

module.exports = router;
