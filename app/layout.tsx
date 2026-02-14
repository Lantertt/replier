import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nanum_Myeongjo, Noto_Sans_KR } from 'next/font/google';

import './globals.css';

const displayFont = Nanum_Myeongjo({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '800'],
});

const bodyFont = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'K-Beauty Reply Assistant',
  description: 'Instagram comment reply assistant MVP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}
