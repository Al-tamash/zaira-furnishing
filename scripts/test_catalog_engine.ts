import assert from 'node:assert';
import { getDatabase } from '../src/lib/db';
import { createCatalog } from '../src/lib/catalog/engine';

async function runTests() {
  console.log('Running Catalog Engine Test Suite...\n');

  const db = getDatabase();
  const catalog = createCatalog(db);

  // Check 1: listCategories() returns categories from the database
  const categories = await catalog.listCategories();
  assert(Array.isArray(categories), 'Categories must be an array');
  assert(categories.length > 0, 'Categories array must not be empty');
  assert(categories.some((c) => c.slug === 'curtains-drapes'), 'Must include curtains-drapes category');
  console.log(`[PASS] Check 1: listCategories() returned ${categories.length} categories.`);

  // Check 2: getCategory('curtains') resolves to curtains-drapes
  const curtainsCategory = await catalog.getCategory('curtains');
  assert(curtainsCategory !== null, 'getCategory("curtains") must resolve to a category');
  assert.strictEqual(curtainsCategory.slug, 'curtains-drapes', 'Alias "curtains" must normalize to "curtains-drapes"');
  console.log(`[PASS] Check 2: getCategory('curtains') resolved to "${curtainsCategory.slug}".`);

  // Check 3: listSubcategories('curtains-drapes') returns subcategories
  const subcategories = await catalog.listSubcategories('curtains-drapes');
  assert(Array.isArray(subcategories), 'Subcategories must be an array');
  assert(subcategories.length > 0, 'Subcategories array must not be empty');
  assert(subcategories.every((s) => s.categoryId === curtainsCategory.id), 'Subcategories must belong to curtains category');
  console.log(`[PASS] Check 3: listSubcategories('curtains-drapes') returned ${subcategories.length} subcategories.`);

  // Check 4: listProducts({ categorySlug: 'curtains' }) returns curtain products
  const curtainProducts = await catalog.listProducts({ categorySlug: 'curtains' });
  assert(Array.isArray(curtainProducts), 'Curtain products must be an array');
  assert(curtainProducts.length > 0, 'Curtain products must not be empty');
  assert(
    curtainProducts.every((p) => p.categorySlug === 'curtains-drapes'),
    'All returned products must have normalized categorySlug "curtains-drapes"'
  );
  console.log(`[PASS] Check 4: listProducts({ categorySlug: 'curtains' }) returned ${curtainProducts.length} products.`);

  // Check 5: getProduct(...) on an active product returns product with variations, specs, and images
  const targetSlug = curtainProducts[0]?.slug || 'blackout-curtains';
  const product = await catalog.getProduct(targetSlug);
  assert(product !== null, `Active product "${targetSlug}" must be found`);
  assert.strictEqual(product.slug, targetSlug, 'Product slug must match');
  assert(Array.isArray(product.images) && product.images.length > 0, 'Product must contain images');
  assert(Array.isArray(product.variations) && product.variations.length > 0, 'Product must contain variations');
  assert(Array.isArray(product.specifications) && product.specifications.length > 0, 'Product must contain specifications');
  assert(typeof product.curtainType === 'string' && product.curtainType.length > 0, 'Backward compatibility curtainType must be populated');
  console.log(`[PASS] Check 5: getProduct('${targetSlug}') returned product with ${product.images.length} images, ${product.variations.length} variants, and ${product.specifications.length} specs.`);

  // Check 6: Non-existent slug returns null
  const nonExistent = await catalog.getProduct('non-existent-luxury-item-xyz-123');
  assert.strictEqual(nonExistent, null, 'Non-existent product slug must return null');
  console.log('[PASS] Check 6: Non-existent product query correctly returned null.');

  console.log('\nAll 6 catalog engine checks passed successfully!');
}

runTests().catch((err) => {
  console.error('\nCatalog engine test suite failed:', err);
  process.exit(1);
});
