// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Route to get all categories and their subcategories
router.get('/', categoryController.getAllCategories);

// Route to create a new main category
router.post('/', categoryController.createCategory);

// Route to create a new subcategory
router.post('/subcategory', categoryController.createSubcategory);

module.exports = router;