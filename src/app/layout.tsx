
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poker Mini - Farcaster Mini App',
  description: 'Play Texas Hold\'em poker in this Farcaster mini app',
  openGraph: {
    title: 'Poker Mini',
    description: 'Play Texas Hold\'em poker in this Farcaster mini app',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
