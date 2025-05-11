import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/utils/mongodb';

// GET /api/users/[id]
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/users/[id]
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    
    // Exclude sensitive fields
    const { password, role, ...updateData } = data;
    
    const user = await updateUser(id, updateData);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
} 