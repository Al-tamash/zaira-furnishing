import { NextRequest, NextResponse } from 'next/server';
import { getDbCmsSection, getDbAllCmsSections } from '@/lib/db/queries/cms';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (section) {
      const data = await getDbCmsSection(section);
      if (!data) {
        return NextResponse.json({ error: 'CMS section not found' }, { status: 404 });
      }
      return NextResponse.json({ data });
    }

    const sections = await getDbAllCmsSections();
    return NextResponse.json({ data: sections });
  } catch (error) {
    console.error('API /api/cms error:', error);
    return NextResponse.json({ error: 'Failed to fetch CMS content' }, { status: 500 });
  }
}
