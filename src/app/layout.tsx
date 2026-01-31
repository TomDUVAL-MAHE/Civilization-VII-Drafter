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
        <nav
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#333',
            color: 'white',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          <a href="/draft" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            Draft
          </a>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
