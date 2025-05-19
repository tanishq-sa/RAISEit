import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/utils/mongodb';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

// POST /api/reset-password
export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }
    await connectToDatabase();
    // Find user by resetToken
    const user = await User.findOne({ resetToken: token });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return NextResponse.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return NextResponse.json({ error: 'Failed to reset password.' }, { status: 500 });
  }
} 