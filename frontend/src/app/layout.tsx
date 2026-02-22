import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Notion-Gmail Kanban',
  description: 'Real-time Kanban board synced with Notion and Gmail',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
