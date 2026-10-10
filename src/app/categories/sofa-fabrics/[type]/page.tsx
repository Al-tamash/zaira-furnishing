import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDynamicProducts,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
} from '@/lib/db/catalog';
import { SofaFabricTypePage } from '@/components/sofa-fabrics/SofaFabricTypePage';

interface SofaFabricTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await getDynamicSubcategories('cat-3');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: SofaFabricTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const sofaFabricType = await getDynamicSubcategoryBySlug('cat-3', resolved.type);

  if (!sofaFabricType) {
    return {
      title: 'Sofa Fabrics & Upholstery | Zaira Furnishing',
    };
  }

  return {
    title: `${sofaFabricType.name} | Sofa Fabrics & Upholstery | Zaira Furnishing`,
    description: sofaFabricType.description || undefined,
  };
}

export default async function SofaFabricTypeRoute({ params }: SofaFabricTypeRouteProps) {
  const resolved = await params;
  const sofaFabricType = await getDynamicSubcategoryBySlug('cat-3', resolved.type);

  if (!sofaFabricType) {
    notFound();
  }

  // Filter sofa fabric products directly from Cloudflare D1
  const sofaFabricProducts = await getDynamicProducts({
    categorySlug: 'sofa-fabrics-upholstery',
    subcategorySlug: sofaFabricType.slug,
  });

  return <SofaFabricTypePage sofaFabricType={sofaFabricType} products={sofaFabricProducts} />;
}

