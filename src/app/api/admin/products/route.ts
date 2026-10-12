import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { DbProduct } from '@/lib/db/types';
import { createProduct, normalizeCreateProductPayload } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id') || searchParams.get('categoryId');
  const activeParam = searchParams.get('active');
  const featuredParam = searchParams.get('featured');
  const search = searchParams.get('search');

  try {
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    let sql = `
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND active = 1 ORDER BY is_main DESC, display_order ASC LIMIT 1) as main_image,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND active = 1) as variant_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (categoryId) {
      sql += ' AND (p.category_id = ? OR c.slug = ?)';
      params.push(categoryId, categoryId);
    }

    if (activeParam !== null) {
      sql += ' AND p.active = ?';
      params.push(activeParam === '1' || activeParam === 'true' ? 1 : 0);
    }

    if (featuredParam !== null) {
      sql += ' AND p.featured = ?';
      params.push(featuredParam === '1' || featuredParam === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.slug LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.display_order ASC, p.created_at DESC';

    const products = await db.query<
      DbProduct & {
        category_name: string;
        category_slug: string;
        subcategory_name?: string;
        main_image?: string;
        variant_count: number;
      }
    >(sql, params);

    return NextResponse.json(
      { data: products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const input = normalizeCreateProductPayload(rawBody);
    const result = await createProduct(input);

    for (const path of result.affectedPaths) {
      try {
        revalidatePath(path);
      } catch {
        // Ignored in test/script environments where Next.js static store is not attached
      }
    }

    return NextResponse.json({ success: true, id: result.id, slug: result.slug });
  } catch (error) {
    console.error('Admin POST product error:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
