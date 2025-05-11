import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  auctionId: {
    type: String,
    required: true
  },
  playerId: {
    type: String,
    required: true
  },
  playerName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to efficiently query bids by auction and player
BidSchema.index({ auctionId: 1, playerId: 1 });

// Use this check to prevent model redefinition errors in development
export default mongoose.models.Bid || mongoose.model('Bid', BidSchema); 