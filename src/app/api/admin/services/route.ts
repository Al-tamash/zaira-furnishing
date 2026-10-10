import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { DbService } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDatabase();
    const services = await db.query<DbService>('SELECT * FROM services ORDER BY display_order ASC');
    return NextResponse.json({ data: services });
  } catch (error) {
    console.error('Admin GET services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      slug,
      short_desc,
      full_desc,
      image,
      icon_name = 'Sparkles',
      highlights = [],
      requires_site_visit = 0,
      active = 1,
      display_order = 0,
    } = body;

    if (!name || !slug || !short_desc || !image) {
      return NextResponse.json({ error: 'Name, slug, short description, and image are required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `srv-${cleanSlug}`;
    const highlightsJson = Array.isArray(highlights) ? JSON.stringify(highlights) : highlights;

    const db = getDatabase();
    await db.execute(
      `INSERT INTO services (id, name, slug, short_desc, full_desc, image, icon_name, highlights, requires_site_visit, active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        cleanSlug,
        short_desc.trim(),
        full_desc?.trim() || null,
        image.trim(),
        icon_name.trim(),
        highlightsJson,
        requires_site_visit ? 1 : 0,
        active ? 1 : 0,
        Number(display_order) || 0,
      ]
    );

    return NextResponse.json({ success: true, id, slug: cleanSlug });
  } catch (error) {
    console.error('Admin POST service error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      slug,
      short_desc,
      full_desc,
      image,
      icon_name,
      highlights,
      requires_site_visit,
      active,
      display_order,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = await db.queryOne<DbService>('SELECT * FROM services WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : existing.slug;
    const highlightsJson = highlights !== undefined ? (Array.isArray(highlights) ? JSON.stringify(highlights) : highlights) : existing.highlights;

    await db.execute(
      `UPDATE services SET
        name = ?,
        slug = ?,
        short_desc = ?,
        full_desc = ?,
        image = ?,
        icon_name = ?,
        highlights = ?,
        requires_site_visit = ?,
        active = ?,
        display_order = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        cleanSlug,
        short_desc !== undefined ? short_desc.trim() : existing.short_desc,
        full_desc !== undefined ? full_desc.trim() : existing.full_desc,
        image !== undefined ? image.trim() : existing.image,
        icon_name !== undefined ? icon_name.trim() : existing.icon_name,
        highlightsJson,
        requires_site_visit !== undefined ? (requires_site_visit ? 1 : 0) : existing.requires_site_visit,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        display_order !== undefined ? Number(display_order) : existing.display_order,
        id,
      ]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin PUT service error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const permanent = searchParams.get('permanent') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    if (permanent) {
      await db.execute('DELETE FROM services WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deleted: true });
    } else {
      await db.execute('UPDATE services SET active = 0, updated_at = datetime("now") WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deactivated: true });
    }
  } catch (error) {
    console.error('Admin DELETE service error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
