import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDynamicProducts,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
} from '@/lib/db/catalog';
import { CarpetTypePage } from '@/components/carpets/CarpetTypePage';

interface CarpetTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await getDynamicSubcategories('cat-6');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: CarpetTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const carpetType = await getDynamicSubcategoryBySlug('cat-6', resolved.type);

  if (!carpetType) {
    return {
      title: 'Carpets & Rugs | Zaira Furnishing',
    };
  }

  return {
    title: `${carpetType.name} | Carpets & Rugs | Zaira Furnishing`,
    description: carpetType.description || undefined,
  };
}

export default async function CarpetTypeRoute({ params }: CarpetTypeRouteProps) {
  const resolved = await params;
  const carpetType = await getDynamicSubcategoryBySlug('cat-6', resolved.type);

  if (!carpetType) {
    notFound();
  }

  // Filter carpet products directly from Cloudflare D1
  const carpetProducts = await getDynamicProducts({
    categorySlug: 'carpets-rugs',
    subcategorySlug: carpetType.slug,
  });

  return <CarpetTypePage carpetType={carpetType} products={carpetProducts} />;
}

