// models/Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    bookingTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'createdAt' } }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ shopId: 1, bookingTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);