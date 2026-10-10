import { OFFICIAL_CATALOG } from '../src/lib/data/officialCatalog.ts';

const BASE_URL = 'http://localhost:3000';

async function testAllOfficialProducts() {
  console.log('=== VERIFYING ALL OFFICIAL CATALOG PRODUCTS & CATEGORIES ===\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const cat of OFFICIAL_CATALOG) {
    // 1. Test Category Route
    const catUrl = `${BASE_URL}/categories/${cat.slug}`;
    try {
      const res = await fetch(catUrl, { redirect: 'follow', headers: { connection: 'close' } });
      if (res.status === 200) {
        console.log(`  ✅ Category: /categories/${cat.slug} (200 OK)`);
        passed++;
      } else {
        console.error(`  ❌ Category: /categories/${cat.slug} (${res.status})`);
        failed++;
        failures.push(`/categories/${cat.slug}: ${res.status}`);
      }
    } catch (err) {
      console.error(`  ❌ Category: /categories/${cat.slug} (${err.message})`);
      failed++;
      failures.push(`/categories/${cat.slug}: ${err.message}`);
    }

    // 2. Test Products Under Category
    for (const prod of cat.products) {
      const prodUrl = `${BASE_URL}/products/${prod.slug}`;
      try {
        const res = await fetch(prodUrl);
        if (res.status === 200) {
          console.log(`    ✅ Product: /products/${prod.slug} (200 OK)`);
          passed++;
        } else {
          console.error(`    ❌ Product: /products/${prod.slug} (${res.status})`);
          failed++;
          failures.push(`/products/${prod.slug}: ${res.status}`);
        }
      } catch (err) {
        console.error(`    ❌ Product: /products/${prod.slug} (${err.message})`);
        failed++;
        failures.push(`/products/${prod.slug}: ${err.message}`);
      }
    }
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testAllOfficialProducts().catch(console.error);
