import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/utils/mongodb';
import { sendMail } from '@/utils/sendMail';
import crypto from 'crypto';

// POST /api/forget-password
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Find the user by email
    const user = await getUserByEmail(email);
    if (user) {
      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      // Save the token to the user (optionally add expiry)
      await updateUser(user._id, { resetToken, resetTokenExpiry: expiry });
      // Send reset email
      const resetLink = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      const html = `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `;
      await sendMail({
        to: email,
        subject: 'Reset your password for RaiseIt',
        html,
      });
    }
    // Always return success message (do not reveal if email exists)
    return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Failed to process forget password:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
} 