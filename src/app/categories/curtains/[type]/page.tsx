import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDynamicProducts,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
} from '@/lib/db/catalog';
import { CurtainTypePage } from '@/components/curtains/CurtainTypePage';

interface CurtainTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await getDynamicSubcategories('cat-1');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: CurtainTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const curtainType = await getDynamicSubcategoryBySlug('cat-1', resolved.type);

  if (!curtainType) {
    return {
      title: 'Curtains | Zaira Furnishing',
    };
  }

  return {
    title: `${curtainType.name} | Zaira Furnishing`,
    description: curtainType.description || undefined,
  };
}

export default async function CurtainTypeRoute({ params }: CurtainTypeRouteProps) {
  const resolved = await params;
  const curtainType = await getDynamicSubcategoryBySlug('cat-1', resolved.type);

  if (!curtainType) {
    notFound();
  }

  // Filter curtain products directly from Cloudflare D1
  const curtainProducts = await getDynamicProducts({
    categorySlug: 'curtains-drapes',
    subcategorySlug: curtainType.slug,
  });

  return <CurtainTypePage curtainType={curtainType} products={curtainProducts} />;
}

