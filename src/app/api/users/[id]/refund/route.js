import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { amount } = await request.json();
    console.log('[Refund API] Received refund request', { id, amount });
    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('[Refund API] Invalid refund amount', { id, amount });
      return NextResponse.json({ error: 'Invalid refund amount' }, { status: 400 });
    }
    await connectToDatabase();
    const user = await User.findById(id);
    if (!user) {
      console.error('[Refund API] User not found', { id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    user.funds = (user.funds || 0) + amount;
    await user.save();
    console.log('[Refund API] Refund processed successfully', { id, newBalance: user.funds });
    return NextResponse.json({ 
      success: true, 
      message: 'Refund processed successfully',
      newBalance: user.funds 
    });
  } catch (error) {
    console.error('[Refund API] Failed to process refund:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
} 