import fs from 'fs';
import path from 'path';
import { getDatabase } from '../src/lib/db';

async function tableExists(db: ReturnType<typeof getDatabase>, tableName: string): Promise<boolean> {
  const row = await db.queryOne<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    [tableName]
  );
  return Boolean(row);
}

async function columnExists(db: ReturnType<typeof getDatabase>, tableName: string, columnName: string): Promise<boolean> {
  if (!(await tableExists(db, tableName))) return false;
  const cols = await db.query<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return cols.some((c) => c.name === columnName);
}

async function isMigrationAlreadyPresent(db: ReturnType<typeof getDatabase>, migrationId: string): Promise<boolean> {
  switch (migrationId) {
    case '0001_initial_schema':
      return (await tableExists(db, 'products')) && (await tableExists(db, 'categories'));
    case '0002_seed_initial_data': {
      if (!(await tableExists(db, 'categories'))) return false;
      const catCount = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM categories');
      return (catCount?.c || 0) > 0;
    }
    case '0003_customer_auth_cart_wishlist':
      return (await tableExists(db, 'carts')) && (await tableExists(db, 'customer_sessions'));
    case '0004_orders':
      return await columnExists(db, 'orders', 'order_number');
    case '0005_order_notifications':
      return await tableExists(db, 'order_notifications');
    case '0006_quote_measurement_requests':
      return (await tableExists(db, 'quote_requests')) && (await tableExists(db, 'measurement_requests'));
    case '0007_customer_reviews':
      return await tableExists(db, 'product_reviews');
    case '0008_order_source':
      return await columnExists(db, 'orders', 'order_source');
    case '0009_order_notifications_read_status':
      return await columnExists(db, 'order_notifications', 'is_read');
    case '0010_order_status_history':
      return await tableExists(db, 'order_status_history');
    case '0011_contact_inquiries':
      return await tableExists(db, 'contact_inquiries');
    default:
      return false;
  }
}

async function runMigrations() {
  console.log('================================================================');
  console.log('       ZAIRA FURNISHING — RELATIONAL MIGRATION RUNNER           ');
  console.log('================================================================\n');

  const db = getDatabase();

  // 1. Ensure migrations ledger table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const appliedRows = await db.query<{ id: string; name: string }>(
    'SELECT id, name FROM _migrations ORDER BY id ASC'
  );
  const appliedSet = new Set(appliedRows.map((r) => r.id));

  // 2. Discover all SQL files in migrations/
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files in migrations/\n`);

  let appliedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const migrationId = file.replace(/\.sql$/, '');

    // Check if recorded in ledger OR already present in database schema (baselining)
    const isRecorded = appliedSet.has(migrationId);
    const isAlreadyInSchema = await isMigrationAlreadyPresent(db, migrationId);

    if (isRecorded || isAlreadyInSchema) {
      if (!isRecorded && isAlreadyInSchema) {
        // Record baseline
        await db.execute(
          'INSERT OR REPLACE INTO _migrations (id, name, applied_at) VALUES (?, ?, datetime(\'now\'))',
          [migrationId, file]
        );
        console.log(`  [BASELINED] ${file} (schema elements verified already present)`);
      } else {
        console.log(`  [SKIPPED] ${file} (already recorded in ledger)`);
      }
      skippedCount++;
      continue;
    }

    console.log(`  [APPLYING] ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    const startTime = Date.now();
    try {
      await db.runMigration(sql);

      // Record in _migrations table
      await db.execute(
        'INSERT OR REPLACE INTO _migrations (id, name, applied_at) VALUES (?, ?, datetime(\'now\'))',
        [migrationId, file]
      );

      const elapsed = Date.now() - startTime;
      console.log(`  ✓ [APPLIED] ${file} (${elapsed}ms)`);
      appliedCount++;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`\n❌ ERROR applying migration ${file}:`, errorMsg);
      console.error('Migration aborted. Stopping.');
      process.exit(1);
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`Summary: ${appliedCount} applied, ${skippedCount} previously existing / baselined.`);
  console.log('----------------------------------------------------------------\n');

  // Verify all essential tables
  const expectedTables = [
    'categories',
    'subcategories',
    'products',
    'product_images',
    'product_variants',
    'product_specifications',
    'customization_configs',
    'services',
    'cms_content',
    'users',
    'customer_sessions',
    'carts',
    'cart_items',
    'wishlist_items',
    'orders',
    'order_items',
    'order_status_history',
    'order_notifications',
    'quote_requests',
    'measurement_requests',
    'product_reviews',
    'contact_inquiries',
  ];

  const existingTables = await db.query<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );
  const existingSet = new Set(existingTables.map((t) => t.name));

  console.log('Verifying required production schema tables:');
  let missingTables = 0;
  for (const table of expectedTables) {
    if (existingSet.has(table)) {
      console.log(`  ✓ Table '${table}' exists`);
    } else {
      console.log(`  ❌ MISSING table '${table}'`);
      missingTables++;
    }
  }

  if (missingTables > 0) {
    console.error(`\n❌ ${missingTables} required tables are missing!`);
    process.exit(1);
  }

  console.log('\n✅ ALL 22 REQUIRED PRODUCTION SCHEMA TABLES ARE VERIFIED PRESENT AND HEALTHY.\n');
}

runMigrations().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
