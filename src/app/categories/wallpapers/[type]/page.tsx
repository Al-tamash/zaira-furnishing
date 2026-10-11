import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listProducts, listSubcategories, getSubcategory } from '@/lib/catalog';
import { WallpaperTypePage } from '@/components/wallpapers/WallpaperTypePage';

interface WallpaperTypeRouteProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  const subcategories = await listSubcategories('wallpapers-wall-coverings');
  return subcategories.map((t) => ({
    type: t.slug,
  }));
}

export async function generateMetadata({ params }: WallpaperTypeRouteProps): Promise<Metadata> {
  const resolved = await params;
  const wallpaperType = await getSubcategory('wallpapers-wall-coverings', resolved.type);

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
  const wallpaperType = await getSubcategory('wallpapers-wall-coverings', resolved.type);

  if (!wallpaperType) {
    notFound();
  }

  // Filter wallpaper products directly from Cloudflare D1
  const wallpaperProducts = await listProducts({
    categorySlug: 'wallpapers-wall-coverings',
    subcategorySlug: wallpaperType.slug,
  });

  return (
    <WallpaperTypePage
      wallpaperType={wallpaperType as unknown as Parameters<typeof WallpaperTypePage>[0]['wallpaperType']}
      products={wallpaperProducts}
    />
  );
}

