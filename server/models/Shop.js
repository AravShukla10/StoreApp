// models/Shop.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, unique: true },
    // REMOVED: The password field is no longer needed on the shop itself.
    // password: { type: String, required: true, select: false },
    isOpen: { type: Boolean, default: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    // This correctly links the Shop to its Owner.
    owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  },
  { timestamps: true }
);

// REMOVED: The pre-save hook for hashing the password is no longer needed here.

module.exports = mongoose.model('Shop', ShopSchema);
