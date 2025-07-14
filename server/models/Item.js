// models/Item.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    type: { type: String, trim: true },
    quantity_avl: { type: Number, default: 0 },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  },
  { timestamps: true }
);

ItemSchema.index({ shopId: 1 });

module.exports = mongoose.model('Item', ItemSchema);