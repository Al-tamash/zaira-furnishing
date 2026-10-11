import type { MetadataRoute } from 'next';
import { getDynamicProducts, getDynamicCategories } from '@/lib/db/catalog';
import { CURTAIN_TYPES } from '@/lib/data/curtains';
import { BLIND_TYPES } from '@/lib/data/blinds';
import { SOFA_FABRIC_TYPES } from '@/lib/data/sofa-fabrics';
import { WALLPAPER_TYPES } from '@/lib/data/wallpapers';
import { CARPET_TYPES } from '@/lib/data/carpets';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zairafurnishing.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Core Static Brand Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/cart`,
      lastModified: now,
      changeFrequency: 'never',
      priority: 0.3,
    },
  ];

  // 2. Curated Subcategory Dedicated Pages
  const subcategoryRoutes: MetadataRoute.Sitemap = [
    ...CURTAIN_TYPES.map((t) => ({
      url: `${BASE_URL}/categories/curtains/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...BLIND_TYPES.map((t) => ({
      url: `${BASE_URL}/categories/blinds/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...SOFA_FABRIC_TYPES.map((t) => ({
      url: `${BASE_URL}/categories/sofa-fabrics/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...WALLPAPER_TYPES.map((t) => ({
      url: `${BASE_URL}/categories/wallpapers/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...CARPET_TYPES.map((t) => ({
      url: `${BASE_URL}/categories/carpets/${t.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ];

  // 3. Dynamic Category Landing Pages
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getDynamicCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/categories/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error('Error generating sitemap categories:', err);
  }

  // 4. Dynamic Product Detail Pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getDynamicProducts();
    productRoutes = products.map((prod) => ({
      url: `${BASE_URL}/products/${prod.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Error generating sitemap products:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...subcategoryRoutes, ...productRoutes];
}
