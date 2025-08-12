// models/Owner.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const OwnerSchema = new Schema(
  {
    name: { 
      type: String, 
      trim: true, 
      required: [true, 'Owner name is required'] 
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'], 
      unique: true,
      match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'], 
      select: false 
    },
    shop: { 
      type: Schema.Types.ObjectId, 
      ref: 'Shop', 
      required: true 
    },
    // --- NEW: Field to store the owner's push token ---
    expoPushToken: {
        type: String,
    }
  },
  { timestamps: true }
);

// Auto-hash password before saving
OwnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password
OwnerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('Owner', OwnerSchema);