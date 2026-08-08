import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, snapId, phone } = body;

  if (!email || !password || !snapId || !phone) {
    return NextResponse.json({ message: 'Tous les champs sont requis.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: 'Cet email est déjà utilisé.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, snapId, phone }
  });

  const token = createToken(user.id);
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
