import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Civilization VII Drafter',
  description: 'Simple card navigation app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <nav style={{
          padding: '1rem 2rem',
          backgroundColor: '#333',
          color: 'white',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <a href="/" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Home</a>
          <a href="/card1" style={{ opacity: 0.9 }}>Card 1</a>
          <a href="/card2" style={{ opacity: 0.9 }}>Card 2</a>
          <a href="/card3" style={{ opacity: 0.9 }}>Card 3</a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
