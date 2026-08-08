import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }

  const data = await request.json();
  const { name, snapId } = data;
  if (!name || !snapId) {
    return NextResponse.json({ message: 'Nom et ID Snapchat requis.' }, { status: 400 });
  }

  const friend = await prisma.friend.create({
    data: { name, snapId, userId: user.id }
  });

  return NextResponse.json({ friend });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ message: 'Identifiant manquant.' }, { status: 400 });
  }

  await prisma.friend.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
