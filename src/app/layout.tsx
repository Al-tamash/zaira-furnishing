import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { StoreProvider } from '@/lib/context/StoreContext';
import { getDynamicCmsSection } from '@/lib/db/catalog';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zaira Furnishing | Bespoke Interior & Furnishing Showroom',
  description:
    'Experience custom furnishings at Zaira Furnishing. Explore bespoke curtains & drapes, architectural blinds, luxury sofa upholstery, wooden flooring, and curated living decor.',
  keywords: [
    'Zaira Furnishing',
    'luxury curtains',
    'bespoke drapery',
    'window blinds',
    'sofa upholstery fabric',
    'wooden flooring',
    'interior showroom',
    'home decor',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footerCms = await getDynamicCmsSection('site_footer');

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
        <StoreProvider>
          <StorefrontShell footerCms={footerCms}>{children}</StorefrontShell>
        </StoreProvider>
      </body>
    </html>
  );
}
