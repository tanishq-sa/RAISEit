import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const PlayerOwnershipSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  auctionId: String,
  auctionName: String,
  image: String
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'bidder'],
    default: 'bidder'
  },
  funds: {
    type: Number,
    default: 100
  },
  players: [PlayerOwnershipSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Use this check to prevent model redefinition errors in development
export default mongoose.models.User || mongoose.model('User', UserSchema); 