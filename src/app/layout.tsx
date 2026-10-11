import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StorefrontShell } from '@/components/layout/StorefrontShell';
import { StoreProvider } from '@/lib/context/StoreContext';
import { getDynamicCmsSection } from '@/lib/db/catalog';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zairafurnishing.com';

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
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Zaira Furnishing | Bespoke Interior & Furnishing Showroom',
    template: '%s | Zaira Furnishing',
  },
  description:
    'Experience custom furnishings at Zaira Furnishing. Explore bespoke curtains & drapes, architectural blinds, luxury sofa upholstery, wooden flooring, and curated living decor in Hyderabad.',
  keywords: [
    'Zaira Furnishing',
    'luxury curtains Hyderabad',
    'bespoke drapery Puppalguda',
    'window blinds Financial District',
    'sofa upholstery fabric Hyderabad',
    'wooden flooring',
    'interior showroom Hyderabad',
    'home decor atelier',
  ],
  authors: [{ name: 'Zaira Furnishing' }],
  creator: 'Zaira Furnishing',
  publisher: 'Zaira Furnishing',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Zaira Furnishing',
    title: 'Zaira Furnishing | Bespoke Interior & Furnishing Showroom',
    description:
      'Curated bespoke drapery, motorized shades, designer sofa fabrics, and complete home furnishings in Hyderabad.',
    images: [
      {
        url: '/images/hero/living_room.jpg',
        width: 1200,
        height: 630,
        alt: 'Zaira Furnishing Flagship Atelier Hyderabad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zaira Furnishing | Bespoke Interior & Furnishing Showroom',
    description:
      'Curated bespoke drapery, motorized shades, designer sofa fabrics, and complete home furnishings in Hyderabad.',
    images: ['/images/hero/living_room.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  name: 'Zaira Furnishing',
  image: `${BASE_URL}/images/hero/living_room.jpg`,
  url: BASE_URL,
  telephone: '+919959000000',
  priceRange: '₹₹₹',
  description:
    'Flagship interior furnishing showroom specializing in custom drapery, motorized blinds, sofa upholstery, and luxury decor in Hyderabad.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Puppalguda, Near Financial District',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500089',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '17.4116',
    longitude: '78.3615',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '21:00',
    },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#1C1917] selection:bg-[#9A7B56] selection:text-white">
        <StoreProvider>
          <StorefrontShell footerCms={footerCms}>{children}</StorefrontShell>
        </StoreProvider>
      </body>
    </html>
  );
}
