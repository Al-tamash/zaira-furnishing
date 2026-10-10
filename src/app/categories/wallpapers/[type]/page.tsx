import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDynamicProducts,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
} from '@/lib/db/catalog';
import { WallpaperTypePage } from '@/components/wallpapers/WallpaperTypePage';

interface WallpaperTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await getDynamicSubcategories('cat-4');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: WallpaperTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const wallpaperType = await getDynamicSubcategoryBySlug('cat-4', resolved.type);

  if (!wallpaperType) {
    return {
      title: 'Wallpapers & Wall Coverings | Zaira Furnishing',
    };
  }

  return {
    title: `${wallpaperType.name} | Wallpapers & Wall Coverings | Zaira Furnishing`,
    description: wallpaperType.description || undefined,
  };
}

export default async function WallpaperTypeRoute({ params }: WallpaperTypeRouteProps) {
  const resolved = await params;
  const wallpaperType = await getDynamicSubcategoryBySlug('cat-4', resolved.type);

  if (!wallpaperType) {
    notFound();
  }

  // Filter wallpaper products directly from Cloudflare D1
  const wallpaperProducts = await getDynamicProducts({
    categorySlug: 'wallpapers-wall-coverings',
    subcategorySlug: wallpaperType.slug,
  });

  return <WallpaperTypePage wallpaperType={wallpaperType} products={wallpaperProducts} />;
}

