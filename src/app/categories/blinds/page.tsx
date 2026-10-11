import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BlindsLanding } from '@/components/blinds/BlindsLanding';
import { listSubcategories, getSubcategory } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Window Blinds & Shades | Architectural Window Solutions | Zaira Furnishing',
  description:
    'Explore our collection of precision roller blinds, zebra day & night shades, roman shades, wooden louvers, cellular shades, and motorized smart window treatments.',
};

interface BlindsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function BlindsCategoryPage({ searchParams }: BlindsPageProps) {
  const resolved = await searchParams;
  if (resolved?.type && resolved.type !== 'all') {
    const matched = await getSubcategory('window-blinds-shades', resolved.type);
    if (matched) {
      redirect(`/categories/blinds/${matched.slug}`);
    }
  }

  const subcategories = await listSubcategories('window-blinds-shades');

  return (
    <BlindsLanding
      subcategories={subcategories as unknown as Parameters<typeof BlindsLanding>[0]['subcategories']}
    />
  );
}
