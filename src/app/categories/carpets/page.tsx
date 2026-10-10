import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CarpetsLanding } from '@/components/carpets/CarpetsLanding';
import { getDynamicSubcategories, getDynamicSubcategoryBySlug } from '@/lib/db/catalog';

export const metadata: Metadata = {
  title: 'Carpets & Rugs | Hand-Tufted Wool, Silk Blends & Area Rugs | Zaira Furnishing',
  description:
    'Discover bespoke hand-tufted botanical wool rugs, heirloom hand-knotted Persian carpets, lustrous silk-blend rugs, and bespoke wall-to-wall flooring solutions.',
};

interface CarpetsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function CarpetsCategoryPage({ searchParams }: CarpetsPageProps) {
  const resolved = await searchParams;
  if (resolved?.type && resolved.type !== 'all') {
    const matched = await getDynamicSubcategoryBySlug('cat-6', resolved.type);
    if (matched) {
      redirect(`/categories/carpets/${matched.slug}`);
    }
  }

  const subcategories = await getDynamicSubcategories('cat-6');

  return <CarpetsLanding subcategories={subcategories} />;
}
