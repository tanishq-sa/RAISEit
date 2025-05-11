import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/utils/mongodb';

// POST /api/users/[id]/players
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { player } = await request.json();
    
    if (!player) {
      return NextResponse.json({ error: 'Player data is required' }, { status: 400 });
    }
    
    // Get current user
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Add player to user's collection
    const updatedPlayers = [...(user.players || []), player];
    
    // Update user
    const updatedUser = await updateUser(id, { players: updatedPlayers });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to add player to user:', error);
    return NextResponse.json({ error: 'Failed to add player to user' }, { status: 500 });
  }
} 