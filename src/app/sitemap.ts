import type { MetadataRoute } from 'next';
import { listProducts, listCategories, listSubcategories } from '@/lib/catalog';

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
  let subcategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const [curtainsSubs, blindsSubs, sofaSubs, wallpaperSubs, carpetSubs] = await Promise.all([
      listSubcategories('curtains-drapes'),
      listSubcategories('window-blinds-shades'),
      listSubcategories('sofa-fabrics-upholstery'),
      listSubcategories('wallpapers-wall-coverings'),
      listSubcategories('carpets-rugs'),
    ]);

    subcategoryRoutes = [
      ...curtainsSubs.map((t) => ({
        url: `${BASE_URL}/categories/curtains/${t.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
      ...blindsSubs.map((t) => ({
        url: `${BASE_URL}/categories/blinds/${t.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
      ...sofaSubs.map((t) => ({
        url: `${BASE_URL}/categories/sofa-fabrics/${t.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
      ...wallpaperSubs.map((t) => ({
        url: `${BASE_URL}/categories/wallpapers/${t.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
      ...carpetSubs.map((t) => ({
        url: `${BASE_URL}/categories/carpets/${t.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
    ];
  } catch (err) {
    console.error('Error generating sitemap subcategories:', err);
  }

  // 3. Dynamic Category Landing Pages
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
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
