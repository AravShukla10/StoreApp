// controllers/categoryController.js
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// @desc    Create a new main category
// @route   POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists.' });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new subcategory
// @route   POST /api/categories/subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, imageUrl, parentCategoryId } = req.body;
    if (!name || !imageUrl || !parentCategoryId) {
      return res.status(400).json({ message: 'Name, imageUrl, and parentCategoryId are required.' });
    }

    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      return res.status(404).json({ message: 'Parent category not found.' });
    }

    const subcategory = new Subcategory({ name, imageUrl, parentCategory: parentCategoryId });
    await subcategory.save();

    // Add this subcategory to its parent's list
    parentCategory.subcategories.push(subcategory._id);
    await parentCategory.save();

    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all categories with their subcategories populated
// @route   GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('subcategories');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};