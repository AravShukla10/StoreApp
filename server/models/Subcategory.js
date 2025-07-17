// models/Subcategory.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubcategorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  // This stores the image for the subcategory card, like in your screenshot
  imageUrl: {
    type: String,
    trim: true,
    required: true,
  },
  // This links back to the parent category (e.g., "Grocery & Kitchen")
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
}, { timestamps: true });

// Index to efficiently find all subcategories for a given parent
SubcategorySchema.index({ parentCategory: 1 });

module.exports = mongoose.model('Subcategory', SubcategorySchema);