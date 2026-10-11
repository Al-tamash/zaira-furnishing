import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WallpapersLanding } from '@/components/wallpapers/WallpapersLanding';
import { listSubcategories, getSubcategory } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Wallpapers & Wall Coverings | Luxury Murals & Textured Coverings | Zaira Furnishing',
  description:
    'Explore our collection of bespoke botanical wallpapers, textured grasscloth, panoramic scenic murals, natural raw silk panels, and metallic foil wallcoverings.',
};

interface WallpapersPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function WallpapersCategoryPage({ searchParams }: WallpapersPageProps) {
  const resolved = await searchParams;
  if (resolved?.type && resolved.type !== 'all') {
    const matched = await getSubcategory('wallpapers-wall-coverings', resolved.type);
    if (matched) {
      redirect(`/categories/wallpapers/${matched.slug}`);
    }
  }

  const subcategories = await listSubcategories('wallpapers-wall-coverings');

  return (
    <WallpapersLanding
      subcategories={subcategories as unknown as Parameters<typeof WallpapersLanding>[0]['subcategories']}
    />
  );
}
