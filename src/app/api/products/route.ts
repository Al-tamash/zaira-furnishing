import { NextRequest, NextResponse } from 'next/server';
import { getDbProducts, getDbProductBySlug } from '@/lib/db/queries/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const categorySlug = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const search = searchParams.get('search') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (slug) {
      const product = await getDbProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ data: product });
    }

    const products = await getDbProducts({ categorySlug, featured, search, limit });
    return NextResponse.json({
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
