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

  try {
    // Import dynamique de Puppeteer pour éviter les problèmes de build
    const puppeteer = await import('puppeteer');

    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://help.snapchat.com/hc/en-gb/requests/new?co=true&ticket_form_id=149423', {
      waitUntil: 'networkidle2',
    });

    // Remplir le formulaire
    await page.waitForSelector('input[type="email"]', { timeout: 10000 }).catch(() => null);

    // Email
    const emailFields = await page.$$('input[type="email"]');
    if (emailFields.length > 0) {
      await emailFields[0].type(user.email);
    }

    // Sujet
    const subjectFields = await page.$$('input[name*="subject"], input[placeholder*="subject"]');
    if (subjectFields.length === 0) {
      const allInputs = await page.$$('input[type="text"]');
      if (allInputs.length > 0) {
        await allInputs[0].type(`Restauration flammes avec ${friend.name}`);
      }
    } else {
      await subjectFields[0].type(`Restauration flammes avec ${friend.name}`);
    }

    // Description/Message
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

    // Attendre un peu pour que les éléments se remplissent
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Chercher et cliquer le bouton de soumission
    const submitButton = await page.$('button[type="submit"], button[value="Submit"], input[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => null);
    }

    await browser.close();

    return NextResponse.json({
      ok: true,
      message: '✓ Formulaire envoyé avec succès ! Snapchat traitera votre demande dans les heures qui suivent.',
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi:', error);
    return NextResponse.json(
      { message: `Erreur lors de l'envoi: ${error.message}` },
      { status: 500 }
    );
  }
}
