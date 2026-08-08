#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function downloadChromium() {
  try {
    console.log('Téléchargement de Chromium...');
    const browser = await puppeteer.launch({ headless: true });
    await browser.close();
    console.log('✓ Chromium téléchargé avec succès');
    process.exit(0);
  } catch (error) {
    console.log('Note: Chromium ne peut pas être téléchargé en build Vercel (limité), mais l\'app fonctionnera en local.');
    process.exit(0);
  }
}

downloadChromium();
