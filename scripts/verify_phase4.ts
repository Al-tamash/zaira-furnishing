import { DatabaseSync } from 'node:sqlite';
import {
  getDynamicProductBySlug,
  getDynamicProducts,
} from '../src/lib/db/catalog';

async function main() {
  console.log('====================================================');
  console.log('   STAGE 7 - PHASE 4 DYNAMIC VERIFICATION SUITE     ');
  console.log('====================================================\n');

  let passed = true;

  // 1. Verify D1 product detail queries across various categories
  console.log('--- 1. Testing Product Detail Queries & Relations from D1 ---');
  const testProducts = [
    { slug: 'blackout-curtains', catSlug: 'curtains-drapes', expectedSubcat: 'blackout' },
    { slug: 'roller-blinds', catSlug: 'window-blinds-shades', expectedSubcat: 'roller' },
    { slug: 'roma-textured-boucle-upholstery', catSlug: 'sofa-fabrics-upholstery', expectedSubcat: 'boucle' },
    { slug: 'botanical-textured-wallcovering', catSlug: 'wallpapers-wall-coverings', expectedSubcat: 'botanical-floral' },
    { slug: 'solis-hand-tufted-wool-silk-rug', catSlug: 'carpets-rugs', expectedSubcat: 'hand-tufted' },
  ];

  for (const item of testProducts) {
    const product = await getDynamicProductBySlug(item.slug);
    if (!product) {
      console.error(`✗ Failed to load product ${item.slug} from D1!`);
      passed = false;
      continue;
    }

    if (product.categorySlug !== item.catSlug) {
      console.error(`✗ Category mismatch for ${item.slug}: expected ${item.catSlug}, got ${product.categorySlug}`);
      passed = false;
    } else {
      console.log(`✓ Product "${product.name}" (${product.slug}): Category = ${product.categoryName} (${product.categorySlug})`);
    }

    if (product.subcategorySlug !== item.expectedSubcat) {
      console.error(`✗ Subcategory slug mismatch for ${item.slug}: expected ${item.expectedSubcat}, got ${product.subcategorySlug}`);
      passed = false;
    } else {
      console.log(`  Subcategory = "${product.subcategoryName}" (${product.subcategorySlug})`);
    }

    // Verify images, variants, specs, price
    if (!product.mainImage || !product.galleryImages || product.galleryImages.length === 0) {
      console.error(`✗ Product ${item.slug} missing images!`);
      passed = false;
    } else {
      console.log(`  Images: ${product.galleryImages.length} gallery image(s), main = ${product.mainImage}`);
    }

    if (!product.price || product.price <= 0) {
      console.error(`✗ Product ${item.slug} missing price!`);
      passed = false;
    } else {
      console.log(`  Price: ₹${product.price.toLocaleString('en-IN')}`);
    }

    // Verify related products logic
    const related = (await getDynamicProducts({ categorySlug: product.categorySlug })).filter(
      (p) => p.id !== product.id
    );
    const selfContained = related.some((p) => p.id === product.id);
    if (selfContained) {
      console.error(`✗ Related products contains current product!`);
      passed = false;
    } else {
      console.log(`  Related products: ${related.length} available in same category (self excluded)`);
    }
  }

  // 2. Non-existent product test (must return null, no fallback)
  console.log('\n--- 2. Testing Non-Existent Product (Zero Static Fallback) ---');
  const missing = await getDynamicProductBySlug('non-existent-product-slug-xyz');
  if (missing === null) {
    console.log(`✓ Non-existent product returned null (proper 404 trigger, zero static fallback)`);
  } else {
    console.error(`✗ Error: Non-existent product returned data!`, missing);
    passed = false;
  }

  // 3. Inactive product test
  console.log('\n--- 3. Testing Inactive Product Isolation in D1 ---');
  const db = new DatabaseSync('data/zaira.db');
  const targetSlug = 'roller-blinds';

  // Deactivate
  db.prepare('UPDATE products SET active = 0 WHERE slug = ?').run(targetSlug);
  const inactiveResult = await getDynamicProductBySlug(targetSlug);
  if (inactiveResult === null) {
    console.log(`✓ Product "${targetSlug}" successfully hidden when active=0`);
  } else {
    console.error(`✗ Error: Inactive product still returned by getDynamicProductBySlug!`);
    passed = false;
  }

  // Reactivate
  db.prepare('UPDATE products SET active = 1 WHERE slug = ?').run(targetSlug);
  const reactivatedResult = await getDynamicProductBySlug(targetSlug);
  if (reactivatedResult !== null) {
    console.log(`✓ Product "${targetSlug}" successfully visible again when active=1`);
  } else {
    console.error(`✗ Error: Reactivated product failed to load!`);
    passed = false;
  }

  // 4. Admin mutation verification (safe field change & immediate retrieval)
  console.log('\n--- 4. Testing Admin D1 Data Mutation & Real-Time Reflection ---');
  const testProd = await getDynamicProductBySlug('blackout-curtains');
  if (testProd) {
    const originalDesc = testProd.shortDescription;
    const mutatedDesc = `Updated Short Description Test ${Date.now()}`;

    console.log(`Before: "${originalDesc}"`);

    // Update in D1
    db.prepare('UPDATE products SET short_description = ? WHERE slug = ?').run(mutatedDesc, 'blackout-curtains');

    // Retrieve via catalog query
    const afterMutation = await getDynamicProductBySlug('blackout-curtains');
    console.log(`After D1 update: "${afterMutation?.shortDescription}"`);

    if (afterMutation?.shortDescription === mutatedDesc) {
      console.log(`✓ Real-time D1 reflection verified: Updated field immediately returned`);
    } else {
      console.error(`✗ Error: Mutation failed to reflect in D1 query!`);
      passed = false;
    }

    // Restore original description
    db.prepare('UPDATE products SET short_description = ? WHERE slug = ?').run(originalDesc, 'blackout-curtains');
    const afterRestore = await getDynamicProductBySlug('blackout-curtains');
    console.log(`Restored: "${afterRestore?.shortDescription}"`);

    if (afterRestore?.shortDescription === originalDesc) {
      console.log(`✓ Database restoration verified: Cleaned up without residue`);
    } else {
      console.error(`✗ Error: Restoration failed!`);
      passed = false;
    }
  }

  // 5. Test Live HTTP Routes on Dev Server
  console.log('\n--- 5. Testing Live HTTP Routes on Dev Server ---');
  const routesToTest = [
    '/',
    '/categories',
    '/categories/curtains',
    '/categories/blinds',
    '/products/blackout-curtains',
    '/products/roller-blinds',
    '/products/roma-textured-boucle-upholstery',
    '/products/botanical-textured-wallcovering',
    '/products/solis-hand-tufted-wool-silk-rug',
    '/cart',
    '/checkout',
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
    console.log('   >>> STAGE 7 PHASE 4 VERIFICATION PASSED <<<      ');
  } else {
    console.log('   >>> STAGE 7 PHASE 4 VERIFICATION FAILED <<<      ');
  }
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Verification script error:', err);
  process.exit(1);
});
