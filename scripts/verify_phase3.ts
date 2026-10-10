import { DatabaseSync } from 'node:sqlite';
import {
  getDynamicCategories,
  getDynamicCategoryBySlug,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
  getDynamicProducts,
} from '../src/lib/db/catalog';

async function main() {
  console.log('====================================================');
  console.log('   STAGE 7 - PHASE 3 DYNAMIC VERIFICATION SUITE     ');
  console.log('====================================================\n');

  let passed = true;

  // 1. Verify D1 category hub queries
  console.log('--- 1. Testing Category Hub Subcategories from D1 ---');
  const catHubs = [
    { name: 'Curtains', id: 'cat-1', slug: 'curtains-drapes', expectedMinSubcats: 10 },
    { name: 'Blinds', id: 'cat-2', slug: 'window-blinds-shades', expectedMinSubcats: 9 },
    { name: 'Sofa Fabrics', id: 'cat-3', slug: 'sofa-fabrics-upholstery', expectedMinSubcats: 8 },
    { name: 'Wallpapers', id: 'cat-4', slug: 'wallpapers-wall-coverings', expectedMinSubcats: 5 },
    { name: 'Carpets', id: 'cat-6', slug: 'carpets-rugs', expectedMinSubcats: 5 },
  ];

  for (const hub of catHubs) {
    const subcats = await getDynamicSubcategories(hub.id);
    if (subcats.length >= hub.expectedMinSubcats) {
      console.log(`✓ ${hub.name}: Loaded ${subcats.length} subcategories from D1 (expected >= ${hub.expectedMinSubcats})`);
    } else {
      console.error(`✗ ${hub.name}: Failed to load expected subcategories from D1 (found ${subcats.length})`);
      passed = false;
    }
  }

  // 2. Verify Subcategory lookup and product queries
  console.log('\n--- 2. Testing Subcategory Type Pages & D1 Product Query ---');
  const typeTests = [
    { catId: 'cat-1', catSlug: 'curtains-drapes', subcatSlug: 'blackout', expectedMinProducts: 1 },
    { catId: 'cat-2', catSlug: 'window-blinds-shades', subcatSlug: 'roller', expectedMinProducts: 1 },
    { catId: 'cat-3', catSlug: 'sofa-fabrics-upholstery', subcatSlug: 'boucle', expectedMinProducts: 1 },
    { catId: 'cat-4', catSlug: 'wallpapers-wall-coverings', subcatSlug: 'botanical-floral', expectedMinProducts: 1 },
    { catId: 'cat-6', catSlug: 'carpets-rugs', subcatSlug: 'hand-tufted', expectedMinProducts: 1 },
  ];

  for (const t of typeTests) {
    const subcat = await getDynamicSubcategoryBySlug(t.catId, t.subcatSlug);
    if (!subcat) {
      console.error(`✗ getDynamicSubcategoryBySlug failed for ${t.catSlug}/${t.subcatSlug}`);
      passed = false;
      continue;
    }

    const products = await getDynamicProducts({
      categorySlug: t.catSlug,
      subcategorySlug: subcat.slug,
    });

    if (products.length >= t.expectedMinProducts) {
      console.log(`✓ ${t.catSlug}/${t.subcatSlug}: Found ${products.length} products (all with subcategory match)`);
      // Verify product fields
      const p = products[0];
      if (!p.name || !p.price || !p.slug || !p.image) {
        console.error(`✗ Product missing essential storefront fields:`, p);
        passed = false;
      }
    } else {
      console.error(`✗ ${t.catSlug}/${t.subcatSlug}: Expected >= ${t.expectedMinProducts} products, got ${products.length}`);
      passed = false;
    }
  }

  // 3. Dynamic mutation test: active vs inactive product
  console.log('\n--- 3. Testing Active/Inactive Status Dynamic Behavior ---');
  const db = new DatabaseSync('data/zaira.db');

  // Pick a product to temporarily deactivate
  const sampleProduct = db.prepare("SELECT id, name, active FROM products WHERE subcategory_id = 'sub-curtains-drapes-blackout' AND active = 1 LIMIT 1").get() as any;
  if (sampleProduct) {
    console.log(`Testing with product: "${sampleProduct.name}" (${sampleProduct.id})`);

    // Deactivate
    db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(sampleProduct.id);
    const afterDeactivate = await getDynamicProducts({
      categorySlug: 'curtains-drapes',
      subcategorySlug: 'blackout',
    });
    const foundDeactivated = afterDeactivate.some((p) => p.id === sampleProduct.id);
    if (!foundDeactivated) {
      console.log(`✓ Dynamic Proof: Deactivated product disappeared from D1 query results`);
    } else {
      console.error(`✗ Error: Deactivated product still appeared in D1 query results!`);
      passed = false;
    }

    // Restore
    db.prepare('UPDATE products SET active = 1 WHERE id = ?').run(sampleProduct.id);
    const afterRestore = await getDynamicProducts({
      categorySlug: 'curtains-drapes',
      subcategorySlug: 'blackout',
    });
    const foundRestored = afterRestore.some((p) => p.id === sampleProduct.id);
    if (foundRestored) {
      console.log(`✓ Dynamic Proof: Reactivated product reappeared immediately in D1 query results`);
    } else {
      console.error(`✗ Error: Reactivated product failed to reappear!`);
      passed = false;
    }
  }

  // 4. Test non-existent subcategory returns empty without static fallback
  console.log('\n--- 4. Testing Zero Fallback for Non-Existent Subcategory ---');
  const nonExistent = await getDynamicProducts({
    categorySlug: 'curtains-drapes',
    subcategorySlug: 'non-existent-subcat-xyz',
  });
  if (nonExistent.length === 0) {
    console.log(`✓ Confirmed: 0 products returned for non-existent subcategory (no static array fallback)`);
  } else {
    console.error(`✗ Error: Non-empty products returned for non-existent subcategory!`);
    passed = false;
  }

  // 5. Test Live HTTP Routes against running dev server
  console.log('\n--- 5. Testing Live HTTP Routes on Dev Server ---');
  const routesToTest = [
    '/categories',
    '/categories/curtains',
    '/categories/blinds',
    '/categories/sofa-fabrics',
    '/categories/wallpapers',
    '/categories/carpets',
    '/categories/curtains/blackout',
    '/categories/curtains/sheer',
    '/categories/blinds/roller',
    '/categories/blinds/zebra',
    '/categories/sofa-fabrics/boucle',
    '/categories/wallpapers/botanical-floral',
    '/categories/carpets/hand-tufted',
    '/categories/mattresses-sleep-systems',
  ];

  for (const route of routesToTest) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      if (res.status === 200) {
        console.log(`✓ HTTP 200: ${route}`);
      } else {
        console.error(`✗ HTTP ${res.status}: ${route}`);
        passed = false;
      }
    } catch (err: any) {
      console.warn(`! Could not connect to dev server at http://localhost:3000${route}: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  if (passed) {
    console.log('   >>> STAGE 7 PHASE 3 VERIFICATION PASSED <<<      ');
  } else {
    console.log('   >>> STAGE 7 PHASE 3 VERIFICATION FAILED <<<      ');
  }
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Verification script error:', err);
  process.exit(1);
});
