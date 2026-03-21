import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const p = await params;
    const { walletAddress } = p;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: walletAddress },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error in GET /api/users/[walletAddress]:`, error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
