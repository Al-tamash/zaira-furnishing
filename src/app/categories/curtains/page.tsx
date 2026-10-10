import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CurtainsLanding } from '@/components/curtains/CurtainsLanding';
import { getDynamicSubcategories, getDynamicSubcategoryBySlug } from '@/lib/db/catalog';

export const metadata: Metadata = {
  title: 'Curtains & Drapes | Bespoke Window Treatments | Zaira Furnishing',
  description:
    'Explore our collection of bespoke residential and commercial window curtains, sheer drapes, blackout fabrics, and tailored window treatments.',
};

interface CurtainsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function CurtainsCategoryPage({ searchParams }: CurtainsPageProps) {
  const resolved = await searchParams;
  if (resolved?.type && resolved.type !== 'all') {
    const matched = await getDynamicSubcategoryBySlug('cat-1', resolved.type);
    if (matched) {
      redirect(`/categories/curtains/${matched.slug}`);
    }
  }

  const subcategories = await getDynamicSubcategories('cat-1');

  return <CurtainsLanding subcategories={subcategories} />;
}
