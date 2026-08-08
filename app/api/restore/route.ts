import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé.' }, { status: 401 });
  }

  const data = await request.json();
  const { friendId } = data;

  if (!friendId) {
    return NextResponse.json({ message: 'Identifiant de l’ami requis.' }, { status: 400 });
  }

  const friend = await prisma.friend.findUnique({ where: { id: friendId } });
  if (!friend || friend.userId !== user.id) {
    return NextResponse.json({ message: 'Ami introuvable.' }, { status: 404 });
  }

  return NextResponse.json({ message: 'La demande est prête. Ouvrez le formulaire Snapchat officiel et copiez les informations affichées.' });
}
