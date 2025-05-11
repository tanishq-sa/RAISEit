import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Bid from '@/models/Bid';

// GET /api/bids - Get bids with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const auctionId = searchParams.get('auctionId');
    const playerId = searchParams.get('playerId');
    const highest = searchParams.get('highest') === 'true';
    
    await connectToDatabase();
    
    // Build query based on params
    const query = {};
    if (auctionId) query.auctionId = auctionId;
    if (playerId) query.playerId = playerId;
    
    if (highest && playerId && auctionId) {
      // Get highest bid for a specific player in an auction
      const highestBid = await Bid.findOne(query).sort({ amount: -1 });
      return NextResponse.json({ success: true, bid: highestBid });
    } else {
      // Get all bids matching the query
      const bids = await Bid.find(query).sort({ timestamp: -1 });
      return NextResponse.json({ success: true, bids });
    }
  } catch (error) {
    console.error('Failed to fetch bids:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bids' }, 
      { status: 500 }
    );
  }
}

// POST /api/bids - Create a new bid
export async function POST(request) {
  try {
    const bidData = await request.json();
    
    // Validate required fields
    const requiredFields = ['auctionId', 'playerId', 'playerName', 'userId', 'userName', 'amount'];
    for (const field of requiredFields) {
      if (!bidData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    await connectToDatabase();
    
    // Create the bid
    const newBid = new Bid(bidData);
    await newBid.save();
    
    return NextResponse.json(
      { success: true, bid: newBid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create bid:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bid' },
      { status: 500 }
    );
  }
}
