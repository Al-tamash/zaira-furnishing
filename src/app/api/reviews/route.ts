import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { getAuthenticatedCustomer } from '@/lib/auth/customer';
import {
  getDbProductReviews,
  calculateReviewSummary,
  createDbProductReview,
} from '@/lib/db/queries/reviews';
import { DbProduct } from '@/lib/db/types';

/**
 * GET /api/reviews?productId=... or ?slug=...
 * Fetches real database reviews belonging ONLY to the requested product.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const slug = searchParams.get('slug');

    const targetIdentifier = (productId || slug || '').trim();
    if (!targetIdentifier) {
      return NextResponse.json(
        { error: 'Product ID or slug is required.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await ensureDatabaseSchema(db);

    const prod = await db.queryOne<DbProduct>(
      'SELECT id FROM products WHERE id = ? OR slug = ?',
      [targetIdentifier, targetIdentifier]
    );
    const resolvedProductId = prod ? prod.id : targetIdentifier;

    const reviews = await getDbProductReviews(resolvedProductId);
    const summary = calculateReviewSummary(reviews);

    return NextResponse.json({
      data: reviews,
      total: summary.total,
      averageRating: summary.averageRating,
    });
  } catch (error: any) {
    console.error('API /api/reviews GET error:', error);
    // Graceful fallback: return empty reviews structure so UI never crashes
    return NextResponse.json({
      data: [],
      total: 0,
      averageRating: null,
    });
  }
}

/**
 * POST /api/reviews
 * Submits a new review for a specific product.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, rating, comment, customerName } = body;
    const rawProductId = typeof body.productId === 'string' ? body.productId.trim() : '';
    const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    let productId = rawProductId || rawSlug;

    if (!productId) {
      return NextResponse.json(
        { error: 'A valid Product ID or slug is required.' },
        { status: 400 }
      );
    }

    // Validate customer name (REQUIRED)
    const rawName =
      typeof customerName === 'string'
        ? customerName
        : typeof body.reviewerName === 'string'
        ? body.reviewerName
        : typeof body.name === 'string'
        ? body.name
        : '';
    const trimmedName = rawName.trim();

    if (!trimmedName) {
      return NextResponse.json(
        { error: 'Please enter your name.' },
        { status: 400 }
      );
    }

    // Validate rating (1–5)
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: 'Please select a star rating between 1 and 5.' },
        { status: 400 }
      );
    }

    // Validate review text
    const rawComment =
      typeof comment === 'string'
        ? comment
        : typeof body.reviewComment === 'string'
        ? body.reviewComment
        : typeof body.content === 'string'
        ? body.content
        : '';
    const trimmedComment = rawComment.trim();

    if (!trimmedComment || trimmedComment.length < 5) {
      return NextResponse.json(
        { error: 'Please enter a review of at least 5 characters.' },
        { status: 400 }
      );
    }

    if (trimmedComment.length > 2000) {
      return NextResponse.json(
        { error: 'Review text cannot exceed 2000 characters.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    await ensureDatabaseSchema(db);

    // Verify product exists in database (check by id or slug)
    let existingProduct = await db.queryOne<DbProduct>(
      'SELECT id, name, slug FROM products WHERE id = ? OR slug = ?',
      [productId, rawSlug || productId]
    );

    if (!existingProduct) {
      const { PRODUCTS } = await import('@/lib/data/products');
      const staticProd = PRODUCTS.find(
        (p) => p.id === productId || p.slug === (rawSlug || productId) || p.slug === productId
      );

      if (!staticProd) {
        return NextResponse.json(
          { error: 'Product not found. Reviews can only be submitted for valid products.' },
          { status: 404 }
        );
      }

      const { CATEGORIES } = await import('@/lib/data/categories');
      const matchedCat = CATEGORIES.find((c) => c.slug === staticProd.categorySlug);
      const categoryId = matchedCat ? matchedCat.id : 'cat-1';
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await db.execute(
        `INSERT OR IGNORE INTO products (
          id, category_id, name, display_name, slug, description, short_description, product_type, base_price, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'custom_made', ?, 1, ?, ?)`,
        [
          staticProd.id,
          categoryId,
          staticProd.name,
          staticProd.displayName || staticProd.name,
          staticProd.slug,
          staticProd.description,
          staticProd.shortDescription || staticProd.name,
          staticProd.price || 0,
          now,
          now,
        ]
      );

      existingProduct = await db.queryOne<DbProduct>(
        'SELECT id, name, slug FROM products WHERE id = ? OR slug = ?',
        [staticProd.id, staticProd.slug]
      );
    }

    // Ensure productId is the canonical product primary key
    if (existingProduct) {
      productId = existingProduct.id;
    }

    // Check if customer is authenticated
    const customer = await getAuthenticatedCustomer(req);
    const userId = customer ? customer.id : null;

    // Create review in database
    const review = await createDbProductReview({
      productId,
      userId,
      customerName: trimmedName,
      rating: parsedRating,
      comment: trimmedComment,
    });

    // Revalidate product page cache
    try {
      const productSlugToRevalidate = existingProduct?.slug || rawSlug || slug;
      if (productSlugToRevalidate) {
        revalidatePath(`/products/${productSlugToRevalidate}`);
      }
      revalidatePath('/products');
    } catch (revalErr) {
      console.warn('Review cache revalidation warning:', revalErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully.',
        data: review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /api/reviews POST error:', error);
    if (error?.message && error.message.includes('no such table')) {
      try {
        const db = getDatabase();
        await ensureDatabaseSchema(db);
      } catch (retryErr) {
        console.error('Auto-migration retry error:', retryErr);
      }
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to submit review. Please try again.' },
      { status: 500 }
    );
  }
}
