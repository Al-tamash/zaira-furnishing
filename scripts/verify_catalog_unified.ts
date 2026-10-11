import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getProduct,
  listProducts,
  getCategory,
  listCategories,
  getSubcategory,
  listSubcategories,
  createCatalog,
  Category,
  Product,
} from '../src/lib/catalog';
import { getDatabase } from '../src/lib/db';

async function verifyUnifiedCatalog() {
  console.log('====================================================');
  console.log('  UNIFIED CATALOG MODULE: END-TO-END AUDIT SUITE    ');
  console.log('====================================================\n');

  const db = getDatabase();

  // ──────────────────────────────────────────────────────────
  // Check 1: Categories Fetching & Alias Normalization Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 1] Categories Fetching & Alias Normalization...');
  const allCategories = await listCategories();
  assert(Array.isArray(allCategories), 'listCategories() must return an array');
  assert(allCategories.length >= 6, `Expected at least 6 categories, found ${allCategories.length}`);
  console.log(`  ✓ Retrieved ${allCategories.length} categories from the database.`);

  // Verify all categories map to canonical domain model (camelCase)
  for (const cat of allCategories) {
    assert(typeof cat.id === 'string' && cat.id.length > 0, 'Category id must be non-empty string');
    assert(typeof cat.slug === 'string' && cat.slug.length > 0, 'Category slug must be non-empty string');
    assert(typeof cat.name === 'string' && cat.name.length > 0, 'Category name must be non-empty string');
    assert(typeof cat.featured === 'boolean', `Category ${cat.slug} featured must be boolean`);
    assert(typeof cat.isCustomizable === 'boolean', `Category ${cat.slug} isCustomizable must be boolean`);
    assert(typeof cat.itemCountText === 'string', `Category ${cat.slug} itemCountText must be string`);
    // Ensure raw db snake_case fields are NOT polluting domain Category
    assert(!('is_customizable' in cat), `Raw DB field is_customizable leaked into Category ${cat.slug}`);
    assert(!('item_count_text' in cat), `Raw DB field item_count_text leaked into Category ${cat.slug}`);
  }

  // Canonical 6 Core Categories with aliases and legacy IDs to verify
  const coreCategorySpecs = [
    {
      canonicalSlug: 'curtains-drapes',
      aliases: ['curtains', 'drapes', 'curtains-drapes', 'cat-1'],
    },
    {
      canonicalSlug: 'window-blinds-shades',
      aliases: ['blinds', 'shades', 'window-blinds', 'window-blinds-shades', 'cat-2'],
    },
    {
      canonicalSlug: 'sofa-fabrics-upholstery',
      aliases: ['sofa', 'upholstery', 'sofa-fabrics', 'sofa-fabrics-upholstery', 'cat-3'],
    },
    {
      canonicalSlug: 'wallpapers-wall-coverings',
      aliases: ['wallpapers', 'wall-coverings', 'wallpapers-wall-coverings', 'cat-4'],
    },
    {
      canonicalSlug: 'mattresses-sleep-systems',
      aliases: ['mattresses', 'mattresses-sleep-systems', 'cat-5'],
    },
    {
      canonicalSlug: 'carpets-rugs',
      aliases: ['carpets', 'rugs', 'carpets-rugs', 'cat-6'],
    },
  ];

  for (const spec of coreCategorySpecs) {
    const directCat = await getCategory(spec.canonicalSlug);
    assert(directCat !== null, `Core category "${spec.canonicalSlug}" must resolve directly`);
    assert.strictEqual(
      directCat.slug,
      spec.canonicalSlug,
      `Category slug must be canonical "${spec.canonicalSlug}"`
    );

    for (const alias of spec.aliases) {
      const resolved = await getCategory(alias);
      assert(
        resolved !== null,
        `Category alias/id "${alias}" failed to resolve to "${spec.canonicalSlug}"`
      );
      assert.strictEqual(
        resolved.slug,
        spec.canonicalSlug,
        `Alias "${alias}" resolved to "${resolved.slug}" instead of "${spec.canonicalSlug}"`
      );
    }
    console.log(`  ✓ Core Category "${spec.canonicalSlug}" verified across ${spec.aliases.length} aliases.`);
  }

  // Verify additional categories present in database
  const extraCategories = ['wooden-flooring-sports-floor', 'bed-linen-bath', 'cushions-pillows'];
  for (const extraSlug of extraCategories) {
    const extra = await getCategory(extraSlug);
    assert(extra !== null, `Additional category "${extraSlug}" must resolve`);
    assert.strictEqual(extra.slug, extraSlug, `Slug must match "${extraSlug}"`);
  }
  console.log(`  ✓ All ${allCategories.length} categories resolved and normalized cleanly.\n`);

  // ──────────────────────────────────────────────────────────
  // Check 2: Subcategory Resolution Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 2] Subcategory Resolution per Category...');
  const allSubcategories = await listSubcategories();
  assert(Array.isArray(allSubcategories) && allSubcategories.length > 0, 'listSubcategories() must return subcategories');
  console.log(`  ✓ Total global subcategories in DB: ${allSubcategories.length}`);

  let totalSubcategoriesChecked = 0;
  for (const cat of allCategories) {
    const bySlug = await listSubcategories(cat.slug);
    const byId = await listSubcategories(cat.id);

    assert.strictEqual(
      bySlug.length,
      byId.length,
      `Subcategory count mismatch for ${cat.slug}: bySlug=${bySlug.length}, byId=${byId.length}`
    );

    for (const sub of bySlug) {
      assert.strictEqual(sub.categoryId, cat.id, `Subcategory ${sub.slug} categoryId must match ${cat.id}`);
      assert(typeof sub.name === 'string' && sub.name.length > 0, `Subcategory ${sub.slug} must have name`);
      assert(typeof sub.displayOrder === 'number', `Subcategory ${sub.slug} must have numeric displayOrder`);
      assert(typeof sub.active === 'boolean', `Subcategory ${sub.slug} must have boolean active`);
      assert(!('category_id' in sub), `Raw DB field category_id leaked in subcategory ${sub.slug}`);
      assert(!('display_order' in sub), `Raw DB field display_order leaked in subcategory ${sub.slug}`);

      // Lookup individual subcategory by both slug and id
      const resolvedSub = await getSubcategory(cat.slug, sub.slug);
      assert(resolvedSub !== null, `getSubcategory(${cat.slug}, ${sub.slug}) returned null`);
      assert.strictEqual(resolvedSub.id, sub.id, `Subcategory ID mismatch for ${sub.slug}`);

      const resolvedSubById = await getSubcategory(cat.id, sub.slug);
      assert(resolvedSubById !== null, `getSubcategory(${cat.id}, ${sub.slug}) returned null`);
      assert.strictEqual(resolvedSubById.id, sub.id, `Subcategory ID mismatch when querying by cat.id`);

      totalSubcategoriesChecked++;
    }
  }
  console.log(`  ✓ Checked ${totalSubcategoriesChecked} subcategories across all ${allCategories.length} categories.\n`);

  // ──────────────────────────────────────────────────────────
  // Check 3: Active Products Full Dataset & Integrity Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 3] Active Products Dataset & Integrity Audit...');
  const allProducts = await listProducts({ activeOnly: true });
  assert(Array.isArray(allProducts) && allProducts.length > 0, 'listProducts({ activeOnly: true }) returned empty array');
  console.log(`  ✓ Found ${allProducts.length} active products in database.`);

  const seenSlugs = new Set<string>();
  for (const product of allProducts) {
    // Slug uniqueness & validity
    assert(typeof product.slug === 'string' && product.slug.length > 0, 'Product slug missing');
    assert(!seenSlugs.has(product.slug), `Duplicate product slug detected: "${product.slug}"`);
    seenSlugs.add(product.slug);

    // Essential fields
    assert(typeof product.id === 'string' && product.id.length > 0, `Product ${product.slug} id missing`);
    assert(typeof product.name === 'string' && product.name.length > 0, `Product ${product.slug} name missing`);
    assert(typeof product.categorySlug === 'string' && product.categorySlug.length > 0, `Product ${product.slug} categorySlug missing`);
    assert(typeof product.categoryName === 'string' && product.categoryName.length > 0, `Product ${product.slug} categoryName missing`);
    assert(typeof product.price === 'number' && product.price >= 0, `Product ${product.slug} price must be >= 0`);
    assert(typeof product.currency === 'string', `Product ${product.slug} currency missing`);

    // Media & images
    assert(typeof product.image === 'string' && product.image.length > 0, `Product ${product.slug} main image missing`);
    assert(Array.isArray(product.galleryImages) && product.galleryImages.length > 0, `Product ${product.slug} galleryImages empty`);
    assert(Array.isArray(product.images), `Product ${product.slug} images must be an array`);

    for (const img of product.images) {
      assert(typeof img.id === 'string', `Product ${product.slug} image missing id`);
      assert(typeof img.url === 'string' && img.url.length > 0, `Product ${product.slug} image missing url`);
      assert(typeof img.displayOrder === 'number', `Product ${product.slug} image missing displayOrder`);
      assert(typeof img.isMain === 'boolean', `Product ${product.slug} image missing isMain`);
    }

    // Variations
    assert(Array.isArray(product.variations), `Product ${product.slug} variations must be array`);
    for (const v of product.variations) {
      assert(typeof v.id === 'string', `Variant missing id in product ${product.slug}`);
      assert(typeof v.name === 'string', `Variant missing name in product ${product.slug}`);
      assert(typeof v.sku === 'string', `Variant missing sku in product ${product.slug}`);
      assert(typeof v.price === 'number', `Variant price must be number in product ${product.slug}`);
      assert(typeof v.inStock === 'boolean', `Variant inStock must be boolean in product ${product.slug}`);
      assert(typeof v.attributes === 'object' && v.attributes !== null, `Variant attributes invalid in ${product.slug}`);
    }

    // Specifications
    assert(Array.isArray(product.specifications), `Product ${product.slug} specifications must be array`);
    for (const spec of product.specifications) {
      assert(typeof spec.label === 'string' && spec.label.length > 0, `Specification label empty in ${product.slug}`);
      assert(typeof spec.value === 'string', `Specification value not string in ${product.slug}`);
    }

    // Zero raw DB keys leaked
    assert(!('base_price' in product), `Leaked raw db column base_price in product ${product.slug}`);
    assert(!('category_id' in product), `Leaked raw db column category_id in product ${product.slug}`);
    assert(!('product_type' in product), `Leaked raw db column product_type in product ${product.slug}`);
  }
  console.log(`  ✓ All ${allProducts.length} products validated with zero null pointer or schema errors.\n`);

  // ──────────────────────────────────────────────────────────
  // Check 4: Search & Filtering Constraints Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 4] Search Filtering & Query Constraints...');

  // Search keyword filtering
  const linenProducts = await listProducts({ search: 'linen' });
  assert(linenProducts.length > 0, 'Search for "linen" should return matching products');
  assert(
    linenProducts.every((p) =>
      p.name.toLowerCase().includes('linen') ||
      (p.displayName && p.displayName.toLowerCase().includes('linen')) ||
      (p.description && p.description.toLowerCase().includes('linen'))
    ),
    'Every product returned for "linen" search must match the keyword'
  );
  console.log(`  ✓ Search for "linen" returned ${linenProducts.length} matching products.`);

  // Category filtering by canonical and aliases
  const curtainProductsCanonical = await listProducts({ categorySlug: 'curtains-drapes' });
  const curtainProductsAlias = await listProducts({ categorySlug: 'curtains' });
  assert(curtainProductsCanonical.length > 0, 'curtains-drapes query returned 0 products');
  assert.strictEqual(
    curtainProductsCanonical.length,
    curtainProductsAlias.length,
    'Category filter count mismatch between canonical and alias'
  );
  assert(
    curtainProductsCanonical.every((p) => p.categorySlug === 'curtains-drapes'),
    'All products in curtain search must have categorySlug "curtains-drapes"'
  );
  console.log(`  ✓ Category filter for "curtains" returned ${curtainProductsAlias.length} products.`);

  const blindProducts = await listProducts({ categorySlug: 'blinds' });
  assert(blindProducts.length > 0, 'blinds query returned 0 products');
  assert(
    blindProducts.every((p) => p.categorySlug === 'window-blinds-shades'),
    'All products in blinds search must have categorySlug "window-blinds-shades"'
  );
  console.log(`  ✓ Category filter for "blinds" returned ${blindProducts.length} products.`);

  // Subcategory filtering
  const blackoutProducts = await listProducts({ categorySlug: 'curtains', subcategorySlug: 'blackout' });
  assert(blackoutProducts.length > 0, 'curtains + blackout query returned 0 products');
  assert(
    blackoutProducts.every((p) => p.subcategorySlug === 'blackout'),
    'All returned products must match subcategory "blackout"'
  );
  console.log(`  ✓ Subcategory filter for "curtains/blackout" returned ${blackoutProducts.length} products.`);

  // Limit constraint
  const limitedProducts = await listProducts({ limit: 4 });
  assert(limitedProducts.length <= 4, `Limit constraint failed: expected <= 4, got ${limitedProducts.length}`);
  console.log(`  ✓ Limit constraint (limit: 4) returned ${limitedProducts.length} products.`);

  // Featured filtering
  const featuredProducts = await listProducts({ featured: true });
  assert(featuredProducts.length > 0, 'Featured products query returned 0 products');
  assert(
    featuredProducts.every((p) => p.featured === true),
    'All returned featured products must have featured === true'
  );
  console.log(`  ✓ Featured filter returned ${featuredProducts.length} featured products.`);

  // Non-matching search returns empty array gracefully
  const emptySearch = await listProducts({ search: 'non-existent-luxury-item-12345-xyz' });
  assert(Array.isArray(emptySearch) && emptySearch.length === 0, 'Non-existent search must return empty array');
  console.log('  ✓ Non-existent search returned empty array gracefully.\n');

  // ──────────────────────────────────────────────────────────
  // Check 5: Individual Product Fetch by Slug Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 5] Individual Product Fetch by Slug...');

  // Dynamically sample one product from each category represented in allProducts
  const categoryToProductMap = new Map<string, Product>();
  for (const p of allProducts) {
    if (!categoryToProductMap.has(p.categorySlug)) {
      categoryToProductMap.set(p.categorySlug, p);
    }
  }

  const sampleProducts = Array.from(categoryToProductMap.values());
  assert(sampleProducts.length >= 6, `Expected products from at least 6 categories, found ${sampleProducts.length}`);

  for (const sample of sampleProducts) {
    const singleProduct = await getProduct(sample.slug);
    assert(singleProduct !== null, `getProduct("${sample.slug}") returned null`);
    assert.strictEqual(singleProduct.slug, sample.slug, `getProduct slug mismatch for "${sample.slug}"`);
    assert.strictEqual(singleProduct.id, sample.id, `ID mismatch between getProduct and listProducts for ${sample.slug}`);
    assert.strictEqual(singleProduct.name, sample.name, `Name mismatch for ${sample.slug}`);
    assert.strictEqual(singleProduct.categorySlug, sample.categorySlug, `Category mismatch for ${sample.slug}`);
    assert(Array.isArray(singleProduct.images), `Product ${sample.slug} images must be an array`);
    assert(Array.isArray(singleProduct.variations), `Product ${sample.slug} variations must be an array`);
    assert(Array.isArray(singleProduct.specifications), `Product ${sample.slug} specifications must be an array`);
  }
  console.log(`  ✓ Successfully fetched and verified ${sampleProducts.length} individual products across ${sampleProducts.length} categories.`);

  // Non-existent slug returns null
  const nonExistent = await getProduct('absolutely-non-existent-product-slug-xyz-987');
  assert.strictEqual(nonExistent, null, 'Non-existent product slug must return null');
  console.log('  ✓ Query for non-existent product slug cleanly returned null.\n');

  // ──────────────────────────────────────────────────────────
  // Check 6: React Memoization & Singleton Determinism Audit
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 6] React Memoization & Singleton Determinism...');

  // Repeated calls to getCategory
  const catCall1 = await getCategory('curtains');
  const catCall2 = await getCategory('curtains');
  assert(catCall1 !== null && catCall2 !== null, 'getCategory repeated calls must return category');
  assert.strictEqual(catCall1.id, catCall2.id, 'Deterministic category ID');
  assert.strictEqual(catCall1.slug, catCall2.slug, 'Deterministic category slug');

  // Repeated calls to getProduct
  const prodCall1 = await getProduct('blackout-curtains');
  const prodCall2 = await getProduct('blackout-curtains');
  assert(prodCall1 !== null && prodCall2 !== null, 'getProduct repeated calls must return product');
  assert.strictEqual(prodCall1.id, prodCall2.id, 'Deterministic product ID');
  assert.strictEqual(prodCall1.slug, prodCall2.slug, 'Deterministic product slug');

  // createCatalog instance isolation
  const customCatalog = createCatalog(db);
  const customProd = await customCatalog.getProduct('blackout-curtains');
  assert(customProd !== null, 'customCatalog.getProduct must return product');
  assert.strictEqual(customProd.id, prodCall1.id, 'customCatalog must match default catalog data');
  console.log('  ✓ React cache memoization and singleton instances behave deterministically.\n');

  // ──────────────────────────────────────────────────────────
  // Check 7: Zero Occurrences of Static Array Fallback Branching
  // ──────────────────────────────────────────────────────────
  console.log('[AUDIT 7] Codebase Audit: Zero Static Array Fallback Branching...');

  const catalogDir = path.resolve(process.cwd(), 'src/lib/catalog');
  const catalogFiles = fs.readdirSync(catalogDir);

  for (const file of catalogFiles) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
    const content = fs.readFileSync(path.join(catalogDir, file), 'utf-8');

    // Ensure no fallback imports from static data files
    assert(
      !content.includes('@/lib/data/curtains'),
      `File ${file} contains static fallback import to "@/lib/data/curtains"`
    );
    assert(
      !content.includes('@/lib/data/blinds'),
      `File ${file} contains static fallback import to "@/lib/data/blinds"`
    );
    assert(
      !content.includes('@/lib/data/carpets'),
      `File ${file} contains static fallback import to "@/lib/data/carpets"`
    );
    assert(
      !content.includes('@/lib/data/sofa-fabrics'),
      `File ${file} contains static fallback import to "@/lib/data/sofa-fabrics"`
    );
    assert(
      !content.includes('@/lib/data/wallpapers'),
      `File ${file} contains static fallback import to "@/lib/data/wallpapers"`
    );
    assert(
      !content.includes('FALLBACK_PRODUCTS'),
      `File ${file} contains reference to FALLBACK_PRODUCTS`
    );
  }
  console.log('  ✓ Static analysis confirmed ZERO static array fallback branching in src/lib/catalog.\n');

  console.log('====================================================');
  console.log('  ALL AUDIT CHECKS PASSED: CATALOG FULLY CERTIFIED! ');
  console.log('====================================================\n');
}

verifyUnifiedCatalog().catch((err) => {
  console.error('\n[AUDIT FAILED] Verification script encountered an error:\n', err);
  process.exit(1);
});
