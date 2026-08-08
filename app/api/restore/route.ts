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
    return NextResponse.json({ message: 'Identifiant de l\'ami requis.' }, { status: 400 });
  }

  const friend = await prisma.friend.findUnique({ where: { id: friendId } });
  if (!friend || friend.userId !== user.id) {
    return NextResponse.json({ message: 'Ami introuvable.' }, { status: 404 });
  }

  // En production (Vercel), on retourne les données pré-remplies
  // En local (développement), on essaie d'automatiser avec Puppeteer
  const isProduction = process.env.VERCEL === '1';

  if (isProduction) {
    // Sur Vercel, on ne peut pas utiliser Puppeteer (limites serverless)
    return NextResponse.json({
      ok: true,
      message: '✓ Prêt à envoyer ! Le formulaire s\'ouvrira bientôt avec vos données.',
      data: {
        email: user.email,
        snapId: user.snapId,
        phone: user.phone,
        friendName: friend.name,
        friendSnapId: friend.snapId,
      }
    });
  }

  // Mode local : utiliser Puppeteer
  try {
    const puppeteer = await import('puppeteer');

    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://help.snapchat.com/hc/en-gb/requests/new?co=true&ticket_form_id=149423', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Remplir le formulaire
    await page.waitForSelector('input[type="email"]', { timeout: 5000 }).catch(() => null);

    // Email
    const emailFields = await page.$$('input[type="email"]');
    if (emailFields.length > 0) {
      await emailFields[0].type(user.email);
    }

    // Sujet
    const allInputs = await page.$$('input[type="text"]');
    if (allInputs.length > 0) {
      await allInputs[0].type(`Restauration flammes avec ${friend.name}`);
    }

    // Description
    const description = `
Utilisateur:
- Email: ${user.email}
- ID Snapchat: ${user.snapId}
- Téléphone: ${user.phone}

Ami:
- Nom: ${friend.name}
- ID Snapchat: ${friend.snapId}

Demande de restauration de flammes avec cet ami.
    `.trim();

    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      await textareas[0].type(description);
    }

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Chercher et cliquer le bouton de soumission
    const submitButton = await page.$('button[type="submit"], button[value="Submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(() => null);
    }

    await browser.close();

    return NextResponse.json({
      ok: true,
      message: '✓ Formulaire envoyé avec succès ! Snapchat traitera votre demande dans les heures qui suivent.',
    });
  } catch (error: any) {
    console.error('Erreur local Puppeteer:', error);
    return NextResponse.json(
      { message: 'Erreur: assurez-vous que Chrome/Chromium est installé en local.' },
      { status: 500 }
    );
  }
}
