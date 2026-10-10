import { NextRequest, NextResponse } from 'next/server';
import { getDbCategories, getDbCategoryBySlug, getDbSubcategories } from '@/lib/db/queries/categories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const category = await getDbCategoryBySlug(slug);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      const subcategories = await getDbSubcategories(category.id);
      return NextResponse.json({
        data: {
          ...category,
          subcategories,
        },
      });
    }

    const [categories, subcategories] = await Promise.all([
      getDbCategories(),
      getDbSubcategories(),
    ]);

    const data = categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
    }));

    return NextResponse.json({
      data,
      total: data.length,
    });
  } catch (error) {
    console.error('API /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
