import { NextResponse } from 'next/server';
import { createUser } from '@/utils/mongodb';

// POST /api/auth/signup
export async function POST(request) {
  try {
    const userData = await request.json();
    
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    
    try {
      const user = await createUser({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        funds: 5000,
        players: []
      });
      
      return NextResponse.json({ success: true, user });
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