import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { getCategoryHref } from '../src/lib/data/categories';

const BASE_URL = 'http://localhost:3000';

async function testPhase2() {
  console.log('=== STARTING STAGE 7 PHASE 2 VERIFICATION ===\n');

  // 1. Audit Header.tsx imports and source code
  console.log('--- 1. Auditing Header.tsx Static Dependencies ---');
  const headerContent = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

  if (headerContent.includes("from '@/lib/data/products'") || headerContent.includes('from "@/lib/data/products"')) {
    throw new Error('FAIL: Header.tsx still imports from src/lib/data/products!');
  }
  if (headerContent.includes('PRODUCTS')) {
    throw new Error('FAIL: Header.tsx still references PRODUCTS!');
  }
  if (headerContent.includes('mainCategories = [')) {
    throw new Error('FAIL: Header.tsx still defines hardcoded mainCategories!');
  }
  console.log('✓ Header.tsx has ZERO imports of PRODUCTS or src/lib/data/products');
  console.log('✓ Header.tsx has ZERO hardcoded mainCategories array');

  // 2. Verify static catalog file preservation
  console.log('\n--- 2. Verifying Static Catalog File Preservation ---');
  if (!fs.existsSync('src/lib/data/products.ts')) {
    throw new Error('FAIL: src/lib/data/products.ts was deleted prematurely!');
  }
  console.log('✓ src/lib/data/products.ts safely preserved for other unmigrated consumers');

  // 3. Test Header Product Search from D1
  console.log('\n--- 3. Testing Dynamic Product Search (D1 -> API -> Header) ---');
  const searchQueries = ['blackout', 'velvet', 'sheer', 'oak'];
  for (const q of searchQueries) {
    const res = await fetch(`${BASE_URL}/api/products?search=${encodeURIComponent(q)}&limit=5`);
    if (!res.ok) {
      throw new Error(`Failed to query /api/products?search=${q}: status ${res.status}`);
    }
    const json = await res.json();
    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected search results for "${q}" from D1, got 0 items!`);
    }
    const first = json.data[0];
    console.log(`✓ Search "${q}" returned ${json.data.length} items from D1. Top result: "${first.display_name || first.name}" [${first.category_name}] (Price: ${first.currency}${first.base_price || first.starting_price})`);
  }

  // Test negative search
  const resNegative = await fetch(`${BASE_URL}/api/products?search=xyznonexistentterm123`);
  const jsonNegative = await resNegative.json();
  if (jsonNegative.data.length === 0 && jsonNegative.total === 0) {
    console.log('✓ Negative search returned 0 items cleanly without falling back to static data');
  } else {
    throw new Error('Negative search failed to return empty array');
  }

  // 4. Test Header Categories from D1
  console.log('\n--- 4. Testing Dynamic Categories (D1 -> API -> Header) ---');
  const resCat = await fetch(`${BASE_URL}/api/categories`);
  if (!resCat.ok) {
    throw new Error(`Failed to query /api/categories: status ${resCat.status}`);
  }
  const jsonCat = await resCat.json();
  if (!Array.isArray(jsonCat.data) || jsonCat.data.length === 0) {
    throw new Error('Expected D1 categories, got empty array!');
  }

  const db = new DatabaseSync('data/zaira.db');
  const dbCats = db.prepare('SELECT id, name, slug FROM categories WHERE active = 1 ORDER BY display_order ASC').all() as any[];

  if (jsonCat.data.length !== dbCats.length) {
    throw new Error(`Category count mismatch: API returned ${jsonCat.data.length}, DB has ${dbCats.length}`);
  }

  console.log(`✓ All ${jsonCat.data.length} active categories retrieved directly from D1:`);
  for (const cat of jsonCat.data) {
    const resolvedHref = getCategoryHref(cat.slug);
    console.log(`  - ${cat.name} (slug: ${cat.slug}) -> canonical href: ${resolvedHref}`);
  }

  db.close();
  console.log('\n=== ALL PHASE 2 VERIFICATIONS PASSED SUCCESSFULLY ===');
}

testPhase2().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
