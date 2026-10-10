import { NextRequest, NextResponse } from 'next/server';
import { getDynamicProductBySlug } from '@/lib/db/catalog';
import { getDbProductBySlug } from '@/lib/db/queries/products';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }

    // Try dynamic catalog first (with full relations)
    const product = await getDynamicProductBySlug(slug);
    if (product) {
      return NextResponse.json({ data: product });
    }

    // Fallback to raw DB query
    const dbProduct = await getDbProductBySlug(slug);
    if (dbProduct) {
      return NextResponse.json({ data: dbProduct });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('API /api/products/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
