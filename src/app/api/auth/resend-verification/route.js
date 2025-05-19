import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendMail } from '@/utils/sendMail';

// POST /api/auth/resend-verification
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (user.verified) {
      return NextResponse.json({ error: 'Account already verified.' }, { status: 400 });
    }
    const now = new Date();
    const lastSent = user.lastVerificationEmailSent || new Date(0);
    const hoursSinceLast = (now - lastSent) / (1000 * 60 * 60);
    if (hoursSinceLast < 5) {
      const remaining = Math.ceil(5 - hoursSinceLast);
      return NextResponse.json({ error: `You can request a new verification email in ${remaining} hour(s).` }, { status: 429 });
    }
    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.lastVerificationEmailSent = now;
    await user.save();
    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}`;
    const html = `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;
    await sendMail({
      to: user.email,
      subject: 'Verify your email for RaiseIt',
      html,
    });
    return NextResponse.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Failed to resend verification email:', error);
    return NextResponse.json({ error: 'Failed to resend verification email.' }, { status: 500 });
  }
} 