import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDynamicProducts,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
} from '@/lib/db/catalog';
import { BlindTypePage } from '@/components/blinds/BlindTypePage';

interface BlindTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await getDynamicSubcategories('cat-2');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: BlindTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const blindType = await getDynamicSubcategoryBySlug('cat-2', resolved.type);

  if (!blindType) {
    return {
      title: 'Window Blinds & Shades | Zaira Furnishing',
    };
  }

  return {
    title: `${blindType.name} | Window Blinds & Shades | Zaira Furnishing`,
    description: blindType.description || undefined,
  };
}

export default async function BlindTypeRoute({ params }: BlindTypeRouteProps) {
  const resolved = await params;
  const blindType = await getDynamicSubcategoryBySlug('cat-2', resolved.type);

  if (!blindType) {
    notFound();
  }

  // Filter window blinds products directly from Cloudflare D1
  const blindProducts = await getDynamicProducts({
    categorySlug: 'window-blinds-shades',
    subcategorySlug: blindType.slug,
  });

  return <BlindTypePage blindType={blindType} products={blindProducts} />;
}

