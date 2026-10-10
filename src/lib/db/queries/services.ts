import { getDatabase } from '../index';
import { DbService } from '../types';

export async function getDbServices(): Promise<DbService[]> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbService>(
      'SELECT * FROM services WHERE active = 1 ORDER BY display_order ASC'
    );
    return rows || [];
  } catch (error) {
    console.error('Database query error in getDbServices:', error);
    return [];
  }
}

export async function getDbServiceBySlug(slug: string): Promise<DbService | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbService>(
      'SELECT * FROM services WHERE slug = ? AND active = 1',
      [slug]
    );
    return row || null;
  } catch (error) {
    console.error(`Database query error in getDbServiceBySlug for ${slug}:`, error);
    return null;
  }
}
