import type { MetadataRoute } from 'next';
import { listProducts, listCategories, listSubcategories } from '@/lib/catalog';
import { getCategoryHref } from '@/lib/data/categories';

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

  // 2. Dynamic Category Landing Pages & Subcategory Detail Pages
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let subcategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}${getCategoryHref(cat.slug)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    for (const cat of categories) {
      const subs = await listSubcategories(cat.slug);
      const catHref = getCategoryHref(cat.slug);
      for (const s of subs) {
        subcategoryRoutes.push({
          url: `${BASE_URL}${catHref}/${s.slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.85,
        });
      }
    }
  } catch (err) {
    console.error('Error generating sitemap category and subcategory routes:', err);
  }

  // 4. Dynamic Product Detail Pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts();
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
