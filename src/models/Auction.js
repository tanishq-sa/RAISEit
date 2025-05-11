import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sold', 'unsold'],
    default: 'pending'
  },
  soldTo: {
    type: String,
    default: null
  },
  soldToName: {
    type: String,
    default: null
  },
  soldAmount: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null
  }
});

const AuctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  creatorId: {
    type: String,
    required: true
  },
  creatorName: {
    type: String,
    required: true
  },
  baseValue: {
    type: Number,
    required: true
  },
  maxPlayersPerTeam: {
    type: Number,
    required: true,
    default: 3
  },
  bidderBudget: {
    type: Number,
    required: true,
    default: 5000
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  players: [PlayerSchema],
  currentPlayerIndex: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Use this check to prevent model redefinition errors in development
export default mongoose.models.Auction || mongoose.model('Auction', AuctionSchema); 