import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Auction from '@/models/Auction';

// GET /api/auctions/code?code=XYZ123
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Auction code is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const auction = await Auction.findOne({ code });
    
    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found with the provided code' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, auction });
  } catch (error) {
    console.error('Failed to fetch auction by code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auction' },
      { status: 500 }
    );
  }
}