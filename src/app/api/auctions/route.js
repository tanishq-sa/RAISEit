import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Auction from '@/models/Auction';

// Generate a random auction code (6 characters)
const generateAuctionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// GET /api/auctions - Get all auctions with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('publicOnly') === 'true';
    
    await connectToDatabase();
    
    const query = publicOnly ? { isPublic: true } : {};
    const auctions = await Auction.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, auctions });
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auctions' }, 
      { status: 500 }
    );
  }
}

// POST /api/auctions - Create a new auction
export async function POST(request) {
  try {
    const auctionData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'creatorId', 'creatorName', 'baseValue'];
    for (const field of requiredFields) {
      if (!auctionData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    await connectToDatabase();
    
    // Create the auction
    const newAuction = new Auction({
      code: generateAuctionCode(),
      ...auctionData,
      status: 'active',
      currentPlayerIndex: 0
    });
    
    await newAuction.save();
    
    return NextResponse.json(
      { success: true, auction: newAuction },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create auction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create auction' },
      { status: 500 }
    );
  }
}