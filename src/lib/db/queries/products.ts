import { getDatabase } from '../index';
import { DbProduct, DbProductImage, DbProductVariant, DbProductSpecification } from '../types';

export interface FullProductRecord extends DbProduct {
  images: DbProductImage[];
  variants: DbProductVariant[];
  specifications: DbProductSpecification[];
}

export interface DbProductWithCategory extends DbProduct {
  category_name?: string | null;
  category_slug?: string | null;
}

export async function getDbProducts(filters?: {
  categorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
}): Promise<DbProductWithCategory[]> {
  try {
    const db = getDatabase();
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const conditions: string[] = ['p.active = 1'];
    const params: unknown[] = [];

    if (filters?.categorySlug) {
      conditions.push('c.slug = ?');
      params.push(filters.categorySlug);
    }

    if (filters?.featured !== undefined) {
      conditions.push('p.featured = ?');
      params.push(filters.featured ? 1 : 0);
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(p.name LIKE ? OR p.display_name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
      params.push(term, term, term, term);
    }

    sql += ` WHERE ${conditions.join(' AND ')} ORDER BY p.display_order ASC`;

    if (filters?.limit && filters.limit > 0) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    const rows = await db.query<DbProductWithCategory>(sql, params);
    return rows || [];
  } catch (error) {
    console.error('Database query error in getDbProducts:', error);
    // Honest controlled state: return empty array if D1 fails, do NOT silently fall back to stale static data
    return [];
  }
}

export async function getDbProductBySlug(slug: string): Promise<FullProductRecord | null> {
  try {
    const db = getDatabase();
    const product = await db.queryOne<DbProduct>(
      'SELECT * FROM products WHERE slug = ? AND active = 1',
      [slug]
    );

    if (!product) {
      return null;
    }

    const [images, variants, specifications] = await Promise.all([
      db.query<DbProductImage>(
        'SELECT * FROM product_images WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
        [product.id]
      ),
      db.query<DbProductVariant>(
        'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
        [product.id]
      ),
      db.query<DbProductSpecification>(
        'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
        [product.id]
      ),
    ]);

    return {
      ...product,
      images: images || [],
      variants: variants || [],
      specifications: specifications || [],
    };
  } catch (error) {
    console.error(`Database query error in getDbProductBySlug for ${slug}:`, error);
    return null;
  }
}

export async function getDbFeaturedProducts(limit = 6): Promise<FullProductRecord[]> {
  try {
    const db = getDatabase();
    const products = await db.query<DbProduct>(
      'SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY display_order ASC LIMIT ?',
      [limit]
    );

    const fullProducts: FullProductRecord[] = [];
    for (const p of products) {
      const [images, variants, specifications] = await Promise.all([
        db.query<DbProductImage>(
          'SELECT * FROM product_images WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
          [p.id]
        ),
        db.query<DbProductVariant>(
          'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY display_order ASC',
          [p.id]
        ),
        db.query<DbProductSpecification>(
          'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
          [p.id]
        ),
      ]);
      fullProducts.push({
        ...p,
        images: images || [],
        variants: variants || [],
        specifications: specifications || [],
      });
    }

    return fullProducts;
  } catch (error) {
    console.error('Database query error in getDbFeaturedProducts:', error);
    return [];
  }
}
