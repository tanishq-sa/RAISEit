import { NextResponse } from 'next/server';
// import { getUserByEmail, saveResetToken, sendResetEmail } from '@/utils/mongodb';

// POST /api/forget-password
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // --- MOCK LOGIC ---
    // In a real app, you would:
    // 1. Find the user by email
    // 2. Generate a secure token and expiry
    // 3. Save the token to the user (or a separate collection)
    // 4. Send an email with the reset link
    // For now, just return a mock reset link

    // Example:
    // const user = await getUserByEmail(email);
    // if (!user) return NextResponse.json({ success: true }); // Don't reveal user existence
    // const token = await saveResetToken(user._id);
    // await sendResetEmail(email, token);

    const mockToken = Math.random().toString(36).slice(2) + Date.now();
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password/${mockToken}`;

    return NextResponse.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.', resetLink });
  } catch (error) {
    console.error('Failed to process forget password:', error);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
} 