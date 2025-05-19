import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Auction from '@/models/Auction';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    // Find the auction and populate bidders
    const auction = await Auction.findById(id).populate('bidders');
    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Format bidders for response
    const formattedBidders = (auction.bidders || []).map(bidder => ({
      _id: bidder._id.toString(),
      name: bidder.name,
      funds: bidder.funds,
      joinedAt: bidder.joinedAt,
      // add other fields as needed
    }));

    return NextResponse.json({ bidders: formattedBidders });
  } catch (error) {
    console.error('Error fetching bidders:', error);
    return NextResponse.json({ error: 'Failed to fetch bidders' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { id } = await context.params;
    const { userId } = await request.json();
    await connectToDatabase();

    // Find the auction
    const auction = await Auction.findById(id);
    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a bidder
    const alreadyBidder = auction.bidders.some(
      bidderId => bidderId.toString() === user._id.toString()
    );

    if (!alreadyBidder) {
      // Set user's funds to the auction's bidderBudget only if joining for the first time
    user.funds = auction.bidderBudget;
    await user.save();

      auction.bidders.push(user._id);
      await auction.save();

      return NextResponse.json({ success: true, funds: user.funds });
    } else {
      // Do not reset funds, just return current funds
      return NextResponse.json({ message: 'User already a bidder', funds: user.funds });
    }
  } catch (error) {
    console.error('Error joining auction:', error);
    return NextResponse.json({ error: 'Failed to join auction' }, { status: 500 });
  }
} 