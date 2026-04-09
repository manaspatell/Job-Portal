const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schoolSchema = new mongoose.Schema({
    // Track last expired/cancelled subscription for renewal info
    lastSubscription: {
      tier: { type: String, enum: ['silver', 'gold', 'diamond', 'none'], default: 'none' },
      endDate: { type: Date, default: null },
      status: { type: String, enum: ['expired', 'cancelled', 'none'], default: 'none' }
    },
  name: { type: String, required: true, trim: true },
  userId: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true }, // Will be hashed
  location: { type: String, required: true, trim: true },
  genderFilter: { type: String, enum: ['all', 'male', 'female'], default: 'all' },
  status: { type: String, enum: ['active', 'paused'], default: 'active' },
  contact: { type: String, default: '' },
  validityDays: { type: Number, default: null },
  expiryDate: { type: Date, default: null },
  // Profile customization
  logo: { type: String, default: null },
  // Subscription fields
  subscription: {
    tier: { type: String, enum: ['silver', 'gold', 'diamond', 'none'], default: 'none' },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' }
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
schoolSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
schoolSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('School', schoolSchema);
