import { NextRequest, NextResponse } from 'next/server';
import { getDbServices, getDbServiceBySlug } from '@/lib/db/queries/services';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const service = await getDbServiceBySlug(slug);
      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
      return NextResponse.json({ data: service });
    }

    const services = await getDbServices();
    return NextResponse.json({
      data: services,
      total: services.length,
    });
  } catch (error) {
    console.error('API /api/services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
