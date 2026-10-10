import React from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SofaFabricsLanding } from '@/components/sofa-fabrics/SofaFabricsLanding';
import { getDynamicSubcategories, getDynamicSubcategoryBySlug } from '@/lib/db/catalog';

export const metadata: Metadata = {
  title: 'Sofa Fabrics & Upholstery | Bespoke Textiles & Re-Upholstery | Zaira Furnishing',
  description:
    'Explore our collection of luxury upholstery bouclés, performance velvets, washed linens, textured tweeds, and durable outdoor fabrics for bespoke sofas and chairs.',
};

interface SofaFabricsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function SofaFabricsCategoryPage({ searchParams }: SofaFabricsPageProps) {
  const resolved = await searchParams;
  if (resolved?.type && resolved.type !== 'all') {
    const matched = await getDynamicSubcategoryBySlug('cat-3', resolved.type);
    if (matched) {
      redirect(`/categories/sofa-fabrics/${matched.slug}`);
    }
  }

  const subcategories = await getDynamicSubcategories('cat-3');

  return <SofaFabricsLanding subcategories={subcategories} />;
}
