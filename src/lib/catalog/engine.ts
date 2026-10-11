import { DatabaseClient } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import {
  ProductImage,
  ProductVariation,
  ProductSpecification,
  ProductType,
  VariationType,
} from '@/lib/data/types';
import {
  Product,
  Category,
  Subcategory,
  ProductFilter,
  CategoryFilter,
  CatalogService,
} from './types';

interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  image: string;
  display_order?: number;
  active?: number;
  featured?: number;
  is_customizable?: number;
  item_count_text?: string | null;
}

interface DbSubcategoryRow {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  display_order?: number;
  active?: number;
}

interface DbProductRow {
  id: string;
  category_id: string;
  subcategory_id?: string | null;
  name: string;
  display_name?: string | null;
  slug: string;
  description: string;
  short_description: string;
  product_type: string;
  pricing_type?: string;
  base_price: number;
  starting_price?: number;
  unit?: string | null;
  custom_made?: number;
  featured?: number;
  custom_measurement_available?: number;
  active?: number;
  display_order?: number;
  currency?: string | null;
  space_slugs?: string | null;
  created_at?: string;
  updated_at?: string;
  category_name?: string | null;
  category_slug?: string | null;
  subcategory_slug?: string | null;
  subcategory_name?: string | null;
}

interface DbProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order?: number;
  is_main?: number;
  active?: number;
}

interface DbProductVariantRow {
  id: string;
  product_id: string;
  name: string;
  variant_type: string;
  sku: string;
  color_hex?: string | null;
  thumbnail_image?: string | null;
  preview_image?: string | null;
  price_adjustment?: number | null;
  in_stock?: number;
  attributes?: string | null;
  display_order?: number;
  active?: number;
}

interface DbProductSpecificationRow {
  id: string;
  product_id: string;
  label: string;
  value: string;
  display_order?: number;
}

/**
 * Internal slug normalization resolving aliases and legacy IDs to canonical category slugs.
 */
function normalizeCategorySlug(rawSlug: string): string {
  if (!rawSlug) return '';
  const trimmed = rawSlug.trim().toLowerCase();

  const slugMap: Record<string, string> = {
    // Curtains & Drapes
    'curtains': 'curtains-drapes',
    'drapes': 'curtains-drapes',
    'curtains-and-drapes': 'curtains-drapes',
    'curtains-drapes': 'curtains-drapes',
    'cat-1': 'curtains-drapes',

    // Window Blinds & Shades
    'blinds': 'window-blinds-shades',
    'shades': 'window-blinds-shades',
    'window-blinds': 'window-blinds-shades',
    'window-blinds-and-shades': 'window-blinds-shades',
    'window-blinds-shades': 'window-blinds-shades',
    'cat-2': 'window-blinds-shades',

    // Sofa Fabrics & Upholstery
    'sofa': 'sofa-fabrics-upholstery',
    'sofa-fabrics': 'sofa-fabrics-upholstery',
    'upholstery': 'sofa-fabrics-upholstery',
    'sofa-fabrics-and-upholstery': 'sofa-fabrics-upholstery',
    'sofa-fabrics-upholstery': 'sofa-fabrics-upholstery',
    'cat-3': 'sofa-fabrics-upholstery',

    // Wallpapers & Wall Coverings
    'wallpapers': 'wallpapers-wall-coverings',
    'wall-coverings': 'wallpapers-wall-coverings',
    'wallpapers-and-wall-coverings': 'wallpapers-wall-coverings',
    'wallpapers-wall-coverings': 'wallpapers-wall-coverings',
    'cat-4': 'wallpapers-wall-coverings',

    // Mattresses & Sleep Systems
    'mattresses': 'mattresses-sleep-systems',
    'mattresses-and-sleep-systems': 'mattresses-sleep-systems',
    'mattresses-sleep-systems': 'mattresses-sleep-systems',
    'cat-5': 'mattresses-sleep-systems',

    // Carpets & Rugs
    'carpets': 'carpets-rugs',
    'rugs': 'carpets-rugs',
    'carpets-and-rugs': 'carpets-rugs',
    'carpets-rugs': 'carpets-rugs',
    'cat-6': 'carpets-rugs',

    // Wooden Flooring & Sports Floor
    'wooden-flooring': 'wooden-flooring-sports-floor',
    'flooring': 'wooden-flooring-sports-floor',
    'wooden-flooring-and-sports-floor': 'wooden-flooring-sports-floor',
    'wooden-flooring-sports-floor': 'wooden-flooring-sports-floor',
    'cat-7': 'wooden-flooring-sports-floor',

    // Bed Linen & Bath
    'bed-linen': 'bed-linen-bath',
    'bed-linen-and-bath': 'bed-linen-bath',
    'bed-linen-bath': 'bed-linen-bath',
    'cat-9': 'bed-linen-bath',

    // Cushions & Pillows
    'cushions': 'cushions-pillows',
    'pillows': 'cushions-pillows',
    'cushions-and-pillows': 'cushions-pillows',
    'cushions-pillows': 'cushions-pillows',
    'cat-10': 'cushions-pillows',
  };

  if (slugMap[trimmed]) {
    return slugMap[trimmed];
  }

  return trimmed.replace(/-and-/g, '-');
}

function mapCategoryRow(row: DbCategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    image: row.image || '',
    featured: row.featured === 1,
    isCustomizable: row.is_customizable === 1,
    itemCountText: row.item_count_text || '',
  };
}

function mapSubcategoryRow(row: DbSubcategoryRow): Subcategory {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    image: row.image || '',
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    active: row.active === 1,
  };
}

function mapProductRow(
  p: DbProductRow,
  images: DbProductImageRow[] = [],
  variants: DbProductVariantRow[] = [],
  specs: DbProductSpecificationRow[] = []
): Product {
  const sortedImages = [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  const mainImg = sortedImages.find((img) => img.is_main === 1) || sortedImages[0];
  const defaultImage = '/images/hero/living_room.jpg';
  const mainImageUrl = mainImg?.image_url || defaultImage;
  const gallery = sortedImages.map((img) => img.image_url);

  const mappedImages: ProductImage[] = sortedImages.map((img) => ({
    id: img.id,
    url: img.image_url,
    altText: img.alt_text || null,
    displayOrder: typeof img.display_order === 'number' ? img.display_order : 0,
    isMain: img.is_main === 1,
  }));

  let parsedSpaces: string[] = [];
  if (p.space_slugs) {
    try {
      parsedSpaces = typeof p.space_slugs === 'string' ? JSON.parse(p.space_slugs) : p.space_slugs;
      if (!Array.isArray(parsedSpaces)) parsedSpaces = [];
    } catch {
      parsedSpaces = [];
    }
  }

  const mappedVariants: ProductVariation[] = variants.map((v) => {
    let parsedAttrs: Record<string, string> = {};
    if (v.attributes) {
      try {
        parsedAttrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
      } catch {
        parsedAttrs = {};
      }
    }

    const basePrice = typeof p.base_price === 'number' ? p.base_price : 0;
    const priceAdjustment = typeof v.price_adjustment === 'number' ? v.price_adjustment : 0;

    return {
      id: v.id,
      name: v.name,
      type: v.variant_type as VariationType,
      colorHex: v.color_hex || undefined,
      thumbnailImage: v.thumbnail_image || undefined,
      image: v.preview_image || undefined,
      sku: v.sku,
      price: basePrice + priceAdjustment,
      inStock: v.in_stock === 1,
      attributes: parsedAttrs,
    };
  });

  const mappedSpecs: ProductSpecification[] = specs.map((s) => ({
    label: s.label,
    value: s.value,
  }));

  const resolvedCategorySlug = p.category_slug || normalizeCategorySlug(p.category_id || '') || '';
  const resolvedCategoryName = p.category_name || p.category_id || '';
  const resolvedSubcategorySlug = p.subcategory_slug || undefined;
  const resolvedSubcategoryName = p.subcategory_name || undefined;

  const isCurtain = resolvedCategorySlug === 'curtains-drapes' || p.category_id === 'cat-1';
  const isBlind = resolvedCategorySlug === 'window-blinds-shades' || p.category_id === 'cat-2';
  const isSofa = resolvedCategorySlug === 'sofa-fabrics-upholstery' || p.category_id === 'cat-3';
  const isWallpaper = resolvedCategorySlug === 'wallpapers-wall-coverings' || p.category_id === 'cat-4';
  const isCarpet = resolvedCategorySlug === 'carpets-rugs' || p.category_id === 'cat-6';

  const subcategoryCompat =
    resolvedSubcategorySlug ||
    (p.subcategory_id ? p.subcategory_id.replace(/^sub-[^-]+-[^-]+-/, '') : undefined);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    displayName: p.display_name || p.name,
    categorySlug: resolvedCategorySlug,
    categoryName: resolvedCategoryName,
    subcategorySlug: resolvedSubcategorySlug,
    subcategoryName: resolvedSubcategoryName,
    shortDescription: p.short_description || '',
    description: p.description || '',
    productType: (p.product_type as ProductType) || 'custom_made',
    price: typeof p.base_price === 'number' ? p.base_price : 0,
    startingPrice: p.starting_price === 1,
    unit: p.unit || 'piece',
    currency: p.currency || '₹',
    image: mainImageUrl,
    mainImage: mainImageUrl,
    galleryImages: gallery.length > 0 ? gallery : [mainImageUrl],
    images: mappedImages,
    variations: mappedVariants,
    specifications: mappedSpecs,
    spaceSlugs: parsedSpaces,
    featured: p.featured === 1,
    customMeasurementAvailable: p.custom_measurement_available === 1,
    active: p.active === 1,
    displayOrder: typeof p.display_order === 'number' ? p.display_order : 0,
    curtainType: isCurtain ? subcategoryCompat : undefined,
    blindType: isBlind ? subcategoryCompat : undefined,
    sofaFabricType: isSofa ? subcategoryCompat : undefined,
    wallpaperType: isWallpaper ? subcategoryCompat : undefined,
    carpetType: isCarpet ? subcategoryCompat : undefined,
  };
}

async function batchFetchByIds<T>(
  db: DatabaseClient,
  sqlTemplate: (placeholders: string) => string,
  ids: string[]
): Promise<T[]> {
  if (ids.length === 0) return [];
  const CHUNK_SIZE = 400;
  if (ids.length <= CHUNK_SIZE) {
    const placeholders = ids.map(() => '?').join(',');
    return db.query<T>(sqlTemplate(placeholders), ids);
  }
  const results: T[] = [];
  for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
    const chunk = ids.slice(i, i + CHUNK_SIZE);
    const placeholders = chunk.map(() => '?').join(',');
    const part = await db.query<T>(sqlTemplate(placeholders), chunk);
    results.push(...part);
  }
  return results;
}

/**
 * Creates a CatalogService bound directly to the database.
 */
export function createCatalog(db: DatabaseClient): CatalogService {
  return {
    async getCategory(slugOrId: string): Promise<Category | null> {
      await ensureDatabaseSchema(db);
      if (!slugOrId) return null;
      const raw = slugOrId.trim();
      const normalized = normalizeCategorySlug(raw);

      const row = await db.queryOne<DbCategoryRow>(
        `SELECT * FROM categories
         WHERE (slug = ? OR id = ? OR slug = ? OR id = ?) AND active = 1
         LIMIT 1`,
        [normalized, normalized, raw, raw]
      );

      return row ? mapCategoryRow(row) : null;
    },

    async listCategories(filter?: CategoryFilter): Promise<Category[]> {
      await ensureDatabaseSchema(db);
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filter?.activeOnly !== false) {
        conditions.push('active = 1');
      }

      if (filter?.featured !== undefined) {
        conditions.push('featured = ?');
        params.push(filter.featured ? 1 : 0);
      }

      let sql = 'SELECT * FROM categories';
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      sql += ' ORDER BY display_order ASC';

      const rows = await db.query<DbCategoryRow>(sql, params);
      return rows.map(mapCategoryRow);
    },

    async getSubcategory(categorySlugOrId: string, subcategorySlug: string): Promise<Subcategory | null> {
      await ensureDatabaseSchema(db);
      if (!categorySlugOrId || !subcategorySlug) return null;
      const rawCat = categorySlugOrId.trim();
      const normCat = normalizeCategorySlug(rawCat);
      const rawSub = subcategorySlug.trim();
      const lowerSub = rawSub.toLowerCase();

      const row = await db.queryOne<DbSubcategoryRow>(
        `SELECT s.* FROM subcategories s
         JOIN categories c ON s.category_id = c.id
         WHERE (c.slug = ? OR c.id = ? OR c.slug = ? OR c.id = ?)
           AND (s.slug = ? OR s.slug = ? OR s.id = ?)
           AND s.active = 1
         LIMIT 1`,
        [normCat, normCat, rawCat, rawCat, lowerSub, rawSub, rawSub]
      );

      return row ? mapSubcategoryRow(row) : null;
    },

    async listSubcategories(categorySlugOrId?: string): Promise<Subcategory[]> {
      await ensureDatabaseSchema(db);
      if (categorySlugOrId) {
        const rawCat = categorySlugOrId.trim();
        const normCat = normalizeCategorySlug(rawCat);

        const rows = await db.query<DbSubcategoryRow>(
          `SELECT s.* FROM subcategories s
           JOIN categories c ON s.category_id = c.id
           WHERE (c.slug = ? OR c.id = ? OR c.slug = ? OR c.id = ?)
             AND s.active = 1
           ORDER BY s.display_order ASC`,
          [normCat, normCat, rawCat, rawCat]
        );
        return rows.map(mapSubcategoryRow);
      }

      const rows = await db.query<DbSubcategoryRow>(
        'SELECT * FROM subcategories WHERE active = 1 ORDER BY display_order ASC'
      );
      return rows.map(mapSubcategoryRow);
    },

    async getProduct(slugOrId: string): Promise<Product | null> {
      await ensureDatabaseSchema(db);
      if (!slugOrId) return null;
      const target = slugOrId.trim();

      const productRow = await db.queryOne<DbProductRow>(
        `SELECT p.*,
                c.name as category_name, c.slug as category_slug,
                s.slug as subcategory_slug, s.name as subcategory_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN subcategories s ON p.subcategory_id = s.id
         WHERE (p.slug = ? OR p.id = ?) AND p.active = 1
         LIMIT 1`,
        [target, target]
      );

      if (!productRow) {
        return null;
      }

      const [images, variants, specs] = await Promise.all([
        db.query<DbProductImageRow>(
          'SELECT * FROM product_images WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
          [productRow.id]
        ),
        db.query<DbProductVariantRow>(
          'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
          [productRow.id]
        ),
        db.query<DbProductSpecificationRow>(
          'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
          [productRow.id]
        ),
      ]);

      return mapProductRow(productRow, images, variants, specs);
    },

    async listProducts(filter?: ProductFilter): Promise<Product[]> {
      await ensureDatabaseSchema(db);
      const conditions: string[] = [];
      const params: unknown[] = [];

      if (filter?.activeOnly !== false) {
        conditions.push('p.active = 1');
      }

      if (filter?.categorySlug) {
        const rawCat = filter.categorySlug.trim();
        const normCat = normalizeCategorySlug(rawCat);
        conditions.push('(c.slug = ? OR p.category_id = ? OR c.slug = ? OR p.category_id = ?)');
        params.push(normCat, normCat, rawCat, rawCat);
      }

      if (filter?.subcategorySlug) {
        const rawSub = filter.subcategorySlug.trim();
        const lowerSub = rawSub.toLowerCase();
        conditions.push('(s.slug = ? OR s.slug = ? OR p.subcategory_id = ?)');
        params.push(lowerSub, rawSub, rawSub);
      }

      if (filter?.featured !== undefined) {
        conditions.push('p.featured = ?');
        params.push(filter.featured ? 1 : 0);
      }

      if (filter?.search && filter.search.trim()) {
        const term = `%${filter.search.trim()}%`;
        conditions.push('(p.name LIKE ? OR p.display_name LIKE ? OR p.description LIKE ?)');
        params.push(term, term, term);
      }

      let sql = `
        SELECT p.*,
               c.name as category_name, c.slug as category_slug,
               s.slug as subcategory_slug, s.name as subcategory_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
      `;

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY p.display_order ASC, p.created_at DESC';

      if (typeof filter?.limit === 'number' && filter.limit > 0) {
        sql += ' LIMIT ?';
        params.push(filter.limit);
      }

      const products = await db.query<DbProductRow>(sql, params);
      if (!products || products.length === 0) {
        return [];
      }

      const productIds = products.map((p) => p.id);

      const [allImages, allVariants, allSpecs] = await Promise.all([
        batchFetchByIds<DbProductImageRow>(
          db,
          (placeholders) =>
            `SELECT * FROM product_images WHERE product_id IN (${placeholders}) AND active = 1 ORDER BY display_order ASC`,
          productIds
        ),
        batchFetchByIds<DbProductVariantRow>(
          db,
          (placeholders) =>
            `SELECT * FROM product_variants WHERE product_id IN (${placeholders}) AND active = 1 ORDER BY display_order ASC`,
          productIds
        ),
        batchFetchByIds<DbProductSpecificationRow>(
          db,
          (placeholders) =>
            `SELECT * FROM product_specifications WHERE product_id IN (${placeholders}) ORDER BY display_order ASC`,
          productIds
        ),
      ]);

      const imagesByProduct = new Map<string, DbProductImageRow[]>();
      for (const img of allImages) {
        const list = imagesByProduct.get(img.product_id) || [];
        list.push(img);
        imagesByProduct.set(img.product_id, list);
      }

      const variantsByProduct = new Map<string, DbProductVariantRow[]>();
      for (const v of allVariants) {
        const list = variantsByProduct.get(v.product_id) || [];
        list.push(v);
        variantsByProduct.set(v.product_id, list);
      }

      const specsByProduct = new Map<string, DbProductSpecificationRow[]>();
      for (const s of allSpecs) {
        const list = specsByProduct.get(s.product_id) || [];
        list.push(s);
        specsByProduct.set(s.product_id, list);
      }

      return products.map((p) =>
        mapProductRow(
          p,
          imagesByProduct.get(p.id) || [],
          variantsByProduct.get(p.id) || [],
          specsByProduct.get(p.id) || []
        )
      );
    },
  };
}
