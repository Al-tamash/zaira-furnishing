import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listProducts, listSubcategories, getSubcategory } from '@/lib/catalog';
import { CarpetTypePage } from '@/components/carpets/CarpetTypePage';

interface CarpetTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await listSubcategories('carpets-rugs');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: CarpetTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const carpetType = await getSubcategory('carpets-rugs', resolved.type);

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
  const carpetType = await getSubcategory('carpets-rugs', resolved.type);

  if (!carpetType) {
    notFound();
  }

  // Filter carpet products directly from Cloudflare D1
  const carpetProducts = await listProducts({
    categorySlug: 'carpets-rugs',
    subcategorySlug: carpetType.slug,
  });

  return (
    <CarpetTypePage
      carpetType={carpetType as unknown as Parameters<typeof CarpetTypePage>[0]['carpetType']}
      products={carpetProducts}
    />
  );
}

