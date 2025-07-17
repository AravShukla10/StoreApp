// models/Item.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    
    // REMOVED the old 'type' field
    // type: { type: String, trim: true },

    // ADDED references to the new models
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Subcategory', required: true },

    quantity_avl: { type: Number, default: 0 },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    imageUrl: { type: String, trim: true },
    imagePublicId: { type: String, trim: true },
    price_per_quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ItemSchema.index({ shopId: 1 });
// Add index for efficient querying by category and subcategory
ItemSchema.index({ category: 1, subcategory: 1 });

module.exports = mongoose.model('Item', ItemSchema);