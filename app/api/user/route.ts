import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }

  const data = await request.json();
  const { email, snapId, phone } = data;
  if (!email || !snapId || !phone) {
    return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email, snapId, phone }
  });

  return NextResponse.json({ ok: true });
}
