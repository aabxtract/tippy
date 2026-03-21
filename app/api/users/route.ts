import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, name, bio, avatarUrl } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id: walletAddress },
      update: { name, bio, avatarUrl },
      create: {
        id: walletAddress,
        name,
        bio,
        avatarUrl,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { registeredAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
