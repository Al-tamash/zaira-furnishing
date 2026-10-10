import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Production-Safe Database Health Check Endpoint
 * GET /api/health/db
 *
 * Verifies:
 * 1. Database is configured
 * 2. Connectivity is established
 * 3. Ping query succeeds
 *
 * Safety: Never exposes credentials, tokens, account IDs, or secrets.
 */
export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasD1Config = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_D1_DATABASE_ID &&
    process.env.CLOUDFLARE_API_TOKEN
  );

  // Attempt health check via active database provider (Cloudflare D1 or resilient SQLite)

  try {
    const db = getDatabase();
    const health = await db.healthCheck();

    if (!health.ok) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          ok: false,
          configured: true,
          provider: health.provider,
          error: health.error || 'Database ping query failed',
          latencyMs: health.latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      ok: true,
      configured: true,
      provider: health.provider,
      tablesCount: health.tablesCount,
      latencyMs: health.latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database check failed';
    return NextResponse.json(
      {
        status: 'unhealthy',
        ok: false,
        configured: hasD1Config,
        provider: isProduction ? 'd1' : 'sqlite',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
