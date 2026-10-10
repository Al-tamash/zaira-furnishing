import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BlindsLanding } from '@/components/blinds/BlindsLanding';
import { getDynamicSubcategories, getDynamicSubcategoryBySlug } from '@/lib/db/catalog';

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
    const matched = await getDynamicSubcategoryBySlug('cat-2', resolved.type);
    if (matched) {
      redirect(`/categories/blinds/${matched.slug}`);
    }
  }

  const subcategories = await getDynamicSubcategories('cat-2');

  return <BlindsLanding subcategories={subcategories} />;
}
