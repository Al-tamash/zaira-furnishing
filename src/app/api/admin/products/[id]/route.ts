import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import {
  DbProduct,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
  DbCustomizationConfig,
} from '@/lib/db/types';
import {
  updateProduct,
  deleteProduct,
  normalizeUpdateProductPayload,
  ProductNotFoundError,
} from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    const product = await db.queryOne<DbProduct>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const [images, variants, specifications, customization_configs] = await Promise.all([
      db.query<DbProductImage>(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbProductVariant>(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbProductSpecification>(
        'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbCustomizationConfig>(
        'SELECT * FROM customization_configs WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
    ]);

    return NextResponse.json(
      {
        data: {
          ...product,
          images: images || [],
          variants: variants || [],
          specifications: specifications || [],
          customization_configs: customization_configs || [],
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Admin GET product by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rawBody = await req.json();
    const input = normalizeUpdateProductPayload(rawBody);
    const result = await updateProduct(id, input);

    for (const path of result.affectedPaths) {
      try {
        revalidatePath(path);
      } catch {
        // Ignored in test/script environments where Next.js static store is not attached
      }
    }

    return NextResponse.json({ success: true, id: result.id, slug: result.slug });
  } catch (error) {
    console.error('Admin PUT product error:', error);
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';
    const result = await deleteProduct(id, { permanent });

    for (const path of result.affectedPaths) {
      try {
        revalidatePath(path);
      } catch {
        // Ignored in test/script environments where Next.js static store is not attached
      }
    }

    return NextResponse.json({
      success: true,
      deleted: result.action === 'deleted',
      deactivated: result.action === 'deactivated',
    });
  } catch (error) {
    console.error('Admin DELETE product error:', error);
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    );
  }
}
