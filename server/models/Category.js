// models/Category.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  // This will link to all subcategories that belong to it
  subcategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  }],
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);