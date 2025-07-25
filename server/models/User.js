// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    phone: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    cart: [CartItemSchema],
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }],
    pushToken: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);