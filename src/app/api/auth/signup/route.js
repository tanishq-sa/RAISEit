import { NextResponse } from 'next/server';
import { createUser } from '@/utils/mongodb';
import crypto from 'crypto';
import { sendMail } from '@/utils/sendMail';
// import nodemailer from 'nodemailer'; // Uncomment and configure for real email sending

// Helper to send email (pseudo, replace with real nodemailer logic)
async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}`;
  const html = `
    <h2>Verify your email</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
  `;
  await sendMail({
    to: email,
    subject: 'Verify your email for RaiseIt',
    html,
  });
}

// POST /api/auth/signup
export async function POST(request) {
  try {
    const userData = await request.json();
    
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    
    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    try {
      const user = await createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        funds: 5000,
        players: [],
        verified: false,
        verificationToken
      });
      // Send verification email
      await sendVerificationEmail(user.email, verificationToken);
      return NextResponse.json({ success: true, user, message: 'Verification email sent. Please check your inbox.' });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
} 