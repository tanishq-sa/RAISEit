import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/auth/verify?token=...
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
  }
  await connectToDatabase();
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
  }
  user.verified = true;
  user.verificationToken = undefined;
  await user.save();
  return NextResponse.json({ success: true, message: 'Email verified successfully. You can now log in.' });
} 