import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Auction from '@/models/Auction';
import Bid from '@/models/Bid';

// GET /api/auctions/[id]
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    
    await connectToDatabase();
    const auction = await Auction.findById(id);
    
    if (!auction) {
      return NextResponse.json({ success: false, error: 'Auction not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, auction });
  } catch (error) {
    console.error('Failed to fetch auction:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch auction' }, { status: 500 });
  }
}

// PATCH /api/auctions/[id]
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    await connectToDatabase();
    const auction = await Auction.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    
    if (!auction) {
      return NextResponse.json({ success: false, error: 'Auction not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, auction });
  } catch (error) {
    console.error('Failed to update auction:', error);
    return NextResponse.json({ success: false, error: 'Failed to update auction' }, { status: 500 });
  }
}

// DELETE /api/auctions/[id]
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    await Auction.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete auction' }, { status: 500 });
  }
} 