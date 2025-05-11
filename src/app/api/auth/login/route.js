import { NextResponse } from 'next/server';
import { authenticateUser } from '@/utils/mongodb';

// POST /api/auth/login
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    
    const result = await authenticateUser(email, password);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Invalid credentials' }, { status: 401 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 