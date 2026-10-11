import assert from 'node:assert';
import {
  getProduct,
  listProducts,
  getCategory,
  listCategories,
  getSubcategory,
  listSubcategories,
  createCatalog,
} from '../src/lib/catalog';
import { getDatabase } from '../src/lib/db';

async function runTests() {
  console.log('Running Catalog Public Seam Test Suite...\n');

  // Check 1: Importing from src/lib/catalog provides all 6 direct functions and createCatalog
  assert.strictEqual(typeof getProduct, 'function', 'getProduct must be a function');
  assert.strictEqual(typeof listProducts, 'function', 'listProducts must be a function');
  assert.strictEqual(typeof getCategory, 'function', 'getCategory must be a function');
  assert.strictEqual(typeof listCategories, 'function', 'listCategories must be a function');
  assert.strictEqual(typeof getSubcategory, 'function', 'getSubcategory must be a function');
  assert.strictEqual(typeof listSubcategories, 'function', 'listSubcategories must be a function');
  assert.strictEqual(typeof createCatalog, 'function', 'createCatalog must be a function');
  console.log('[PASS] Check 1: All 6 direct functions and createCatalog factory exported.');

  // Check 2: listCategories() returns categories
  const categories = await listCategories();
  assert(Array.isArray(categories), 'Categories must be an array');
  assert(categories.length > 0, 'Categories array must not be empty');
  assert(categories.some((c) => c.slug === 'curtains-drapes'), 'Must include curtains-drapes category');
  console.log(`[PASS] Check 2: listCategories() returned ${categories.length} categories.`);

  // Check 3: getCategory('curtains') resolves to curtains-drapes
  const curtainsCategory = await getCategory('curtains');
  assert(curtainsCategory !== null, 'getCategory("curtains") must resolve');
  assert.strictEqual(curtainsCategory.slug, 'curtains-drapes', 'Alias "curtains" must normalize to "curtains-drapes"');
  console.log(`[PASS] Check 3: getCategory('curtains') resolved to "${curtainsCategory.slug}".`);

  // Check 4: listProducts({ categorySlug: 'curtains' }) returns products
  const curtainProducts = await listProducts({ categorySlug: 'curtains' });
  assert(Array.isArray(curtainProducts), 'Curtain products must be an array');
  assert(curtainProducts.length > 0, 'Curtain products must not be empty');
  assert(
    curtainProducts.every((p) => p.categorySlug === 'curtains-drapes'),
    'All returned products must have normalized categorySlug "curtains-drapes"'
  );
  console.log(`[PASS] Check 4: listProducts({ categorySlug: 'curtains' }) returned ${curtainProducts.length} products.`);

  // Check 5: getProduct(...) retrieves the product
  const targetSlug = curtainProducts[0]?.slug || 'blackout-curtains';
  const product = await getProduct(targetSlug);
  assert(product !== null, `Active product "${targetSlug}" must be found`);
  assert.strictEqual(product.slug, targetSlug, 'Product slug must match');
  assert(Array.isArray(product.images) && product.images.length > 0, 'Product must contain images');
  assert(Array.isArray(product.variations) && product.variations.length > 0, 'Product must contain variations');
  assert(Array.isArray(product.specifications) && product.specifications.length > 0, 'Product must contain specifications');
  console.log(`[PASS] Check 5: getProduct('${targetSlug}') successfully retrieved product.`);

  // Check 6: Repeated call to getProduct(...) within the same turn returns the expected product
  const productRepeated = await getProduct(targetSlug);
  assert(productRepeated !== null, 'Repeated call must return product');
  assert.strictEqual(productRepeated.id, product.id, 'Repeated call must match product id');
  assert.strictEqual(productRepeated.slug, product.slug, 'Repeated call must match product slug');
  console.log('[PASS] Check 6: Repeated call to getProduct(...) successfully verified.');

  // Check 7: createCatalog(customDb) can be instantiated
  const customDb = getDatabase();
  const customCatalog = createCatalog(customDb);
  assert(customCatalog !== null && typeof customCatalog === 'object', 'createCatalog must return CatalogService');
  assert.strictEqual(typeof customCatalog.getProduct, 'function', 'customCatalog.getProduct must be a function');
  assert.strictEqual(typeof customCatalog.listProducts, 'function', 'customCatalog.listProducts must be a function');
  const customCats = await customCatalog.listCategories();
  assert(Array.isArray(customCats) && customCats.length > 0, 'customCatalog can list categories');
  console.log('[PASS] Check 7: createCatalog(customDb) successfully instantiated and queried.');

  console.log('\nAll 7 public catalog seam checks passed successfully!');
}

runTests().catch((err) => {
  console.error('\nCatalog public seam test suite failed:', err);
  process.exit(1);
});
