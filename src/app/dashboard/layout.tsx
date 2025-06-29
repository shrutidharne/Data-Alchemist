// data-alchemist/src/app/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          display: 'flex',
          gap: '2rem',
          padding: '1rem',
          background: '#181c24',
          color: '#fff',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ color: '#61dafb', textDecoration: 'none', fontWeight: 'bold' }}>
            Dashboard
          </Link>
          {/* <Link href="/rules" style={{ color: '#61dafb', textDecoration: 'none', fontWeight: 'bold' }}>
            Rule Builder
          </Link> */}
        </nav>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}