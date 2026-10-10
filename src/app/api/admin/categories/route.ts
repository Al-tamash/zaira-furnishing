import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { CATEGORIES } from '@/lib/data/categories';
import { DbCategory } from '@/lib/db/types';

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const activeParam = searchParams.get('active');

    const db = getDatabase();
    await ensureDatabaseSchema(db);

    let sql = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as product_count,
        (SELECT COUNT(*) FROM subcategories s WHERE s.category_id = c.id) as subcategory_count
      FROM categories c
      WHERE c.slug NOT LIKE '%-alias'
    `;
    const params: unknown[] = [];

    if (activeParam !== null) {
      sql += ' AND c.active = ?';
      params.push(activeParam === '1' || activeParam === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY c.display_order ASC';

    let categories = await db.query<DbCategory & { product_count: number; subcategory_count: number }>(sql, params);

    if (!categories || categories.length === 0) {
      categories = CATEGORIES.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        tagline: cat.tagline,
        description: cat.description,
        image: cat.image,
        display_order: idx,
        active: 1,
        featured: cat.featured ? 1 : 0,
        is_customizable: cat.isCustomizable ? 1 : 0,
        item_count_text: cat.itemCountText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_count: 0,
        subcategory_count: 0,
      }));
    }

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Admin GET categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
      tagline,
      description,
      image,
      display_order = 0,
      active = 1,
      featured = 1,
      is_customizable = 0,
      item_count_text,
    } = body;

    if (!name || !slug || !image) {
      return NextResponse.json({ error: 'Name, slug, and image are required' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const id = `cat-${cleanSlug}`;

    const db = getDatabase();
    const existing = await db.queryOne('SELECT id FROM categories WHERE slug = ?', [cleanSlug]);
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 });
    }

    await db.execute(
      `INSERT INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable, item_count_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        cleanSlug,
        tagline?.trim() || null,
        description?.trim() || null,
        image.trim(),
        Number(display_order) || 0,
        active ? 1 : 0,
        featured ? 1 : 0,
        is_customizable ? 1 : 0,
        item_count_text?.trim() || null,
      ]
    );

    return NextResponse.json({ success: true, id, slug: cleanSlug });
  } catch (error) {
    console.error('Admin POST category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
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
      tagline,
      description,
      image,
      display_order,
      active,
      featured,
      is_customizable,
      item_count_text,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const existing = await db.queryOne<DbCategory>('SELECT * FROM categories WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') : existing.slug;

    await db.execute(
      `UPDATE categories SET
        name = ?,
        slug = ?,
        tagline = ?,
        description = ?,
        image = ?,
        display_order = ?,
        active = ?,
        featured = ?,
        is_customizable = ?,
        item_count_text = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        cleanSlug,
        tagline !== undefined ? tagline : existing.tagline,
        description !== undefined ? description : existing.description,
        image !== undefined ? image.trim() : existing.image,
        display_order !== undefined ? Number(display_order) : existing.display_order,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        is_customizable !== undefined ? (is_customizable ? 1 : 0) : existing.is_customizable,
        item_count_text !== undefined ? item_count_text : existing.item_count_text,
        id,
      ]
    );

    return NextResponse.json({ success: true, id, slug: cleanSlug });
  } catch (error) {
    console.error('Admin PUT category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const db = getDatabase();
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await db.execute('DELETE FROM categories WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deleted: true });
    }

    // Check if category has associated products
    const prodCount = await db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );

    if (prodCount && prodCount.count > 0) {
      // Soft-deactivate to preserve database integrity
      await db.execute('UPDATE categories SET active = 0, updated_at = datetime("now") WHERE id = ?', [id]);
      return NextResponse.json({
        success: true,
        message: 'Category has associated products; safely deactivated instead of deleted.',
        deactivated: true,
      });
    }

    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Admin DELETE category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
