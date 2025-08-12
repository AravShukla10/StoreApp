const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookedItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
}, { _id: false });

const BookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    
    // --- ADDED: Daily sequential order number for convenience ---
    dailyOrderNumber: { type: Number, required: true },

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
// --- UPDATED: Index ensures efficient lookup of the last order for a shop on a given day ---
BookingSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);