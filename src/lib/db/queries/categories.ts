import { getDatabase } from '../index';
import { DbCategory, DbSubcategory } from '../types';

export async function getDbCategories(): Promise<DbCategory[]> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbCategory>(
      'SELECT * FROM categories WHERE active = 1 ORDER BY display_order ASC'
    );
    return rows || [];
  } catch (error) {
    console.error('Database query error in getDbCategories:', error);
    return [];
  }
}

export async function getDbCategoryBySlug(slug: string): Promise<DbCategory | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbCategory>(
      'SELECT * FROM categories WHERE slug = ? AND active = 1',
      [slug]
    );
    return row || null;
  } catch (error) {
    console.error(`Database query error in getDbCategoryBySlug for ${slug}:`, error);
    return null;
  }
}

export async function getDbSubcategories(categoryId?: string): Promise<DbSubcategory[]> {
  try {
    const db = getDatabase();
    let sql = 'SELECT * FROM subcategories WHERE active = 1';
    const params: unknown[] = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    sql += ' ORDER BY display_order ASC';
    const rows = await db.query<DbSubcategory>(sql, params);
    return rows || [];
  } catch (error) {
    console.error('Database query error in getDbSubcategories:', error);
    return [];
  }
}
