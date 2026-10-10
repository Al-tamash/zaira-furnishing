import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { DbCmsContent } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const sections = await db.query<DbCmsContent>('SELECT * FROM cms_content');
    const result: Record<string, DbCmsContent> = {};
    for (const s of sections) {
      result[s.section_key] = s;
    }
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Admin GET CMS error:', error);
    return NextResponse.json({ error: 'Failed to fetch CMS content' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { section_key, title, subtitle, content, image_url, secondary_image_url } = body;

    if (!section_key) {
      return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
    }

    const contentJson = typeof content === 'object' ? JSON.stringify(content) : content;

    const db = getDatabase();
    await db.execute(
      `INSERT INTO cms_content (id, section_key, title, subtitle, content, image_url, secondary_image_url, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(section_key) DO UPDATE SET
        title = excluded.title,
        subtitle = excluded.subtitle,
        content = excluded.content,
        image_url = excluded.image_url,
        secondary_image_url = excluded.secondary_image_url,
        updated_at = datetime('now')`,
      [
        `cms-${section_key}`,
        section_key,
        title || null,
        subtitle || null,
        contentJson || null,
        image_url || null,
        secondary_image_url || null,
      ]
    );

    return NextResponse.json({ success: true, section_key });
  } catch (error) {
    console.error('Admin PUT CMS error:', error);
    return NextResponse.json({ error: 'Failed to update CMS section' }, { status: 500 });
  }
}
