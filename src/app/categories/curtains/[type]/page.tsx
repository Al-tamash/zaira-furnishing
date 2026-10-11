import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listProducts, listSubcategories, getSubcategory } from '@/lib/catalog';
import { CurtainTypePage } from '@/components/curtains/CurtainTypePage';

interface CurtainTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await listSubcategories('curtains-drapes');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: CurtainTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const curtainType = await getSubcategory('curtains-drapes', resolved.type);

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
  const curtainType = await getSubcategory('curtains-drapes', resolved.type);

  if (!curtainType) {
    notFound();
  }

  // Filter curtain products directly from Cloudflare D1
  const curtainProducts = await listProducts({
    categorySlug: 'curtains-drapes',
    subcategorySlug: curtainType.slug,
  });

  return (
    <CurtainTypePage
      curtainType={curtainType as unknown as Parameters<typeof CurtainTypePage>[0]['curtainType']}
      products={curtainProducts}
    />
  );
}

