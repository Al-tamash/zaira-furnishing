import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CurtainsLanding } from '@/components/curtains/CurtainsLanding';
import { listSubcategories, getSubcategory } from '@/lib/catalog';

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
    const matched = await getSubcategory('curtains-drapes', resolved.type);
    if (matched) {
      redirect(`/categories/curtains/${matched.slug}`);
    }
  }

  const subcategories = await listSubcategories('curtains-drapes');

  return (
    <CurtainsLanding
      subcategories={subcategories as unknown as Parameters<typeof CurtainsLanding>[0]['subcategories']}
    />
  );
}
