import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FootLineBot',
  description: 'LINE Messaging Bot for Amateur Football Group Management',
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
