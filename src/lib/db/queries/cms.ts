import { getDatabase } from '../index';
import { DbCmsContent } from '../types';

export async function getDbCmsSection(sectionKey: string): Promise<DbCmsContent | null> {
  try {
    const db = getDatabase();
    const row = await db.queryOne<DbCmsContent>(
      'SELECT * FROM cms_content WHERE section_key = ?',
      [sectionKey]
    );
    if (row) return row;
  } catch (error) {
    console.warn(`Database query fallback for CMS section ${sectionKey}:`, error);
  }

  return null;
}

export async function getDbAllCmsSections(): Promise<Record<string, DbCmsContent>> {
  try {
    const db = getDatabase();
    const rows = await db.query<DbCmsContent>('SELECT * FROM cms_content');
    const result: Record<string, DbCmsContent> = {};
    for (const r of rows) {
      result[r.section_key] = r;
    }
    return result;
  } catch (error) {
    console.warn('Database query fallback for all CMS sections:', error);
    return {};
  }
}
