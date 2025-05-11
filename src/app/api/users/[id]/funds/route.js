import { NextResponse } from 'next/server';
import { updateUserFunds } from '@/utils/mongodb';

// PATCH /api/users/[id]/funds
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const { funds } = await request.json();
    
    if (funds === undefined || isNaN(parseFloat(funds))) {
      return NextResponse.json({ error: 'Valid funds amount is required' }, { status: 400 });
    }
    
    const user = await updateUserFunds(id, parseFloat(funds));
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user funds:', error);
    return NextResponse.json({ error: 'Failed to update user funds' }, { status: 500 });
  }
} 