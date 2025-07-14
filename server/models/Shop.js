// models/Shop.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const ShopSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // hashed
    isOpen: { type: Boolean, default: true },
    items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
);

// 🔐 Auto‑hash password on create / update
ShopSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Shop', ShopSchema);