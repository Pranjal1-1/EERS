import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EERS — Employee Excellence & Recognition System',
  description: 'Performance, recognition, awards and AI-assisted employee insights.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
