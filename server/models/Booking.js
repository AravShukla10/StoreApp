const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the structure for items within a booking
const BookedItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Price at the time of booking
}, { _id: false });


const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },

    // The 'items' field is now an array
    items: [BookedItemSchema],

    totalAmount: { type: Number, required: true },

    bookingTime: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    isCompleted: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ shopId: 1, bookingTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);