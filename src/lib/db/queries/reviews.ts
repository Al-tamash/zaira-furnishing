import crypto from 'crypto';
import { getDatabase } from '../index';
import { DbProductReview } from '../types';

export interface ProductReviewSummary {
  total: number;
  averageRating: string | null;
}

/**
 * Human-friendly date formatting for customer reviews.
 */
export function formatReviewDate(dateString: string): string {
  try {
    const d = new Date(dateString.includes('T') ? dateString : dateString.replace(' ', 'T') + 'Z');
    if (isNaN(d.getTime())) return dateString;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;

    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Checks whether an authenticated user has genuinely purchased this product in any order.
 */
export async function checkUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false;
  try {
    const db = getDatabase();
    const row = await db.queryOne<{ id: string }>(
      `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ?
       LIMIT 1`,
      [userId, productId]
    );
    return Boolean(row);
  } catch (error) {
    console.error('Error checking user purchase:', error);
    return false;
  }
}

/**
 * Fetches all approved reviews for a specific product, ordered by creation date descending.
 */
export async function getDbProductReviews(productId: string): Promise<DbProductReview[]> {
  if (!productId) return [];
  try {
    const db = getDatabase();
    // Resolve canonical product id and slug if product exists
    const prod = await db.queryOne<{ id: string; slug: string }>(
      'SELECT id, slug FROM products WHERE id = ? OR slug = ?',
      [productId, productId]
    );
    const targetIds = prod ? Array.from(new Set([prod.id, prod.slug, productId])) : [productId];
    const placeholders = targetIds.map(() => '?').join(', ');

    const rows = await db.query<DbProductReview>(
      `SELECT * FROM product_reviews
       WHERE product_id IN (${placeholders}) AND status = 'APPROVED'
       ORDER BY created_at DESC`,
      targetIds
    );
    return rows || [];
  } catch (error) {
    console.error('Database query error in getDbProductReviews:', error);
    return [];
  }
}

/**
 * Calculates dynamic review count and average rating from a list of approved reviews.
 */
export function calculateReviewSummary(reviews: DbProductReview[]): ProductReviewSummary {
  if (!reviews || reviews.length === 0) {
    return { total: 0, averageRating: null };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = (sum / reviews.length).toFixed(1);
  return {
    total: reviews.length,
    averageRating: avg,
  };
}

/**
 * Calculates dynamic review count and average rating for a product from real database reviews.
 */
export async function getDbProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
  const reviews = await getDbProductReviews(productId);
  return calculateReviewSummary(reviews);
}

/**
 * Creates and stores a customer review in the database.
 */
export async function createDbProductReview(data: {
  productId: string;
  userId?: string | null;
  customerName: string;
  rating: number;
  comment: string;
}): Promise<DbProductReview> {
  const trimmedName = data.customerName ? data.customerName.trim() : '';
  if (!trimmedName) {
    throw new Error('Please enter your name.');
  }

  const db = getDatabase();
  const id = `rev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  // 1. Resolve canonical product ID (by primary key id OR slug)
  let canonicalProductId = data.productId;
  const existingProd = await db.queryOne<{ id: string; slug: string }>(
    'SELECT id, slug FROM products WHERE id = ? OR slug = ?',
    [data.productId, data.productId]
  );

  if (existingProd) {
    canonicalProductId = existingProd.id;
  } else {
    throw new Error('Product not found. Reviews can only be submitted for valid existing products.');
  }

  // 2. Safely verify user foreign key constraint
  let validUserId: string | null = null;
  if (data.userId) {
    const existingUser = await db.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE id = ?',
      [data.userId]
    );
    if (existingUser) {
      validUserId = existingUser.id;
    }
  }

  // 3. Check genuine verified purchase if user is genuinely authenticated
  let isVerified = 0;
  if (validUserId) {
    const hasPurchased = await checkUserPurchasedProduct(validUserId, canonicalProductId);
    isVerified = hasPurchased ? 1 : 0;
  }

  // 4. Insert into product_reviews table
  await db.execute(
    `INSERT INTO product_reviews (
      id, product_id, user_id, customer_name, rating, comment, is_verified_purchase, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)`,
    [
      id,
      canonicalProductId,
      validUserId,
      trimmedName,
      data.rating,
      data.comment.trim(),
      isVerified,
      now,
      now,
    ]
  );

  const created = await db.queryOne<DbProductReview>(
    'SELECT * FROM product_reviews WHERE id = ?',
    [id]
  );

  if (!created) {
    throw new Error('Failed to retrieve newly created review.');
  }

  return created;
}
