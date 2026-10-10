import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { DbSubcategory } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId') || searchParams.get('category_id');

    const db = getDatabase();
    await ensureDatabaseSchema(db);

    let sql = `
      SELECT 
        s.*,
        c.name as category_name,
        (SELECT COUNT(*) FROM products p WHERE p.subcategory_id = s.id) as product_count
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    const params: unknown[] = [];

    if (categoryId) {
      sql += ' WHERE (s.category_id = ? OR c.slug = ?)';
      params.push(categoryId, categoryId);
    }

    sql += ' ORDER BY s.display_order ASC';

    const subcategories = await db.query<DbSubcategory & { category_name: string; product_count: number }>(sql, params);
    return NextResponse.json({ data: subcategories || [] });
  } catch (error) {
    console.error('Admin GET subcategories error:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category_id, name, slug, description, image, display_order = 0, active = 1 } = body;

    if (!category_id || !name || !slug) {
      return NextResponse.json({ error: 'Category ID, name, and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `sub-${cleanSlug}-${Date.now().toString().slice(-4)}`;

    const db = getDatabase();
    const existing = await db.queryOne(
      'SELECT id FROM subcategories WHERE category_id = ? AND slug = ?',
      [category_id, cleanSlug]
    );

    if (existing) {
      return NextResponse.json({ error: 'Subcategory slug already exists for this category' }, { status: 409 });
    }

    await db.execute(
      `INSERT INTO subcategories (id, category_id, name, slug, description, image, display_order, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        category_id,
        name.trim(),
        cleanSlug,
        description?.trim() || null,
        image?.trim() || null,
        Number(display_order) || 0,
        active ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true, id, slug: cleanSlug });
  } catch (error) {
    console.error('Admin POST subcategory error:', error);
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, slug, description, image, display_order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = await db.queryOne<DbSubcategory>('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : existing.slug;

    await db.execute(
      `UPDATE subcategories SET
        name = ?,
        slug = ?,
        description = ?,
        image = ?,
        display_order = ?,
        active = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        cleanSlug,
        description !== undefined ? description : existing.description,
        image !== undefined ? image : existing.image,
        display_order !== undefined ? Number(display_order) : existing.display_order,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        id,
      ]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Admin PUT subcategory error:', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deleted: true });
    }

    // Check if subcategory has associated products
    const prodCount = await db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM products WHERE subcategory_id = ?',
      [id]
    );

    if (prodCount && prodCount.count > 0) {
      // Soft deactivate to avoid breaking product links
      await db.execute('UPDATE subcategories SET active = 0, updated_at = datetime("now") WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deactivated: true });
    }

    await db.execute('DELETE FROM subcategories WHERE id = ?', [id]);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Admin DELETE subcategory error:', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}
