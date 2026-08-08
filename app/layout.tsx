import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SnapFlam Restore',
  description: 'Outil minimaliste pour préparer une restauration de flammes Snapchat.',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
