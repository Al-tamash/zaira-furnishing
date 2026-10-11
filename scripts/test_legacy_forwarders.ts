import assert from 'node:assert';
import {
  getDynamicCategories,
  getDynamicCategoryBySlug,
  getDynamicSubcategories,
  getDynamicSubcategoryBySlug,
  getDynamicProducts,
  getDynamicProductBySlug,
  getDynamicServices,
  getDynamicCategoryDiscovery,
} from '../src/lib/db/catalog';
import {
  getDbProducts,
  getDbProductBySlug,
  getDbFeaturedProducts,
} from '../src/lib/db/queries/products';

async function runTests() {
  console.log('Running Legacy Forwarders Regression Test Suite...\n');

  // 1. getDynamicCategories() from @/lib/db/catalog returns categories
  const categories = await getDynamicCategories();
  assert(Array.isArray(categories), 'Categories must be an array');
  assert(categories.length > 0, 'Categories must not be empty');
  assert(categories.some((c) => c.slug === 'curtains-drapes'), 'Must include curtains-drapes category');
  console.log(`[PASS] 1. getDynamicCategories() returned ${categories.length} categories.`);

  // 2. getDynamicCategoryBySlug('curtains') returns the curtains category
  const curtainsCat = await getDynamicCategoryBySlug('curtains');
  assert(curtainsCat !== null, 'getDynamicCategoryBySlug("curtains") must resolve');
  assert.strictEqual(curtainsCat.slug, 'curtains-drapes', 'Alias "curtains" must normalize to "curtains-drapes"');
  console.log(`[PASS] 2. getDynamicCategoryBySlug('curtains') resolved to "${curtainsCat.slug}".`);

  // 3. getDynamicSubcategories('curtains') and getDynamicSubcategories('cat-1')
  const curtainSubcats = await getDynamicSubcategories('curtains');
  assert(Array.isArray(curtainSubcats), 'Subcategories must be an array');
  assert(curtainSubcats.length > 0, 'Curtains must have subcategories');
  assert('category_id' in curtainSubcats[0], 'Must map to DbSubcategory with category_id');
  console.log(`[PASS] 3. getDynamicSubcategories('curtains') returned ${curtainSubcats.length} subcategories.`);

  // 4. getDynamicSubcategoryBySlug('curtains', 'blackout')
  const blackoutSub = await getDynamicSubcategoryBySlug('curtains', 'blackout');
  assert(blackoutSub !== null, 'Blackout subcategory must resolve for curtains');
  assert.strictEqual(blackoutSub.slug, 'blackout', 'Slug must match blackout');
  console.log(`[PASS] 4. getDynamicSubcategoryBySlug('curtains', 'blackout') resolved.`);

  // 5. getDynamicProducts({ categorySlug: 'curtains' }) returns products
  const curtainProducts = await getDynamicProducts({ categorySlug: 'curtains' });
  assert(Array.isArray(curtainProducts), 'Curtain products must be an array');
  assert(curtainProducts.length > 0, 'Must return curtain products');
  assert(
    curtainProducts.every((p) => p.categorySlug === 'curtains-drapes'),
    'All returned products must have categorySlug "curtains-drapes"'
  );
  console.log(`[PASS] 5. getDynamicProducts({ categorySlug: 'curtains' }) returned ${curtainProducts.length} products.`);

  // 6. getDynamicProductBySlug(...) returns the product
  const targetSlug = curtainProducts[0]?.slug || 'blackout-curtains';
  const dynamicProduct = await getDynamicProductBySlug(targetSlug);
  assert(dynamicProduct !== null, `Product "${targetSlug}" must be found`);
  assert.strictEqual(dynamicProduct.slug, targetSlug, 'Product slug must match');
  assert(Array.isArray(dynamicProduct.images) && dynamicProduct.images.length > 0, 'Must have images');
  assert(Array.isArray(dynamicProduct.variations) && dynamicProduct.variations.length > 0, 'Must have variations');
  assert(Array.isArray(dynamicProduct.specifications) && dynamicProduct.specifications.length > 0, 'Must have specs');
  console.log(`[PASS] 6. getDynamicProductBySlug('${targetSlug}') returned product.`);

  // 7. getDbProducts() and getDbProducts({ categorySlug: 'curtains' }) from @/lib/db/queries/products
  const dbProducts = await getDbProducts({ categorySlug: 'curtains' });
  assert(Array.isArray(dbProducts), 'getDbProducts must return array');
  assert(dbProducts.length > 0, 'Must return db products');
  const firstDbProd = dbProducts[0];
  assert('base_price' in firstDbProd || 'price' in firstDbProd, 'Must provide pricing info');
  assert(firstDbProd.slug, 'Must have product slug');
  console.log(`[PASS] 7. getDbProducts({ categorySlug: 'curtains' }) returned ${dbProducts.length} products.`);

  // 8. getDbProductBySlug(...) from @/lib/db/queries/products
  const dbProduct = await getDbProductBySlug(targetSlug);
  assert(dbProduct !== null, `getDbProductBySlug("${targetSlug}") must find product`);
  assert.strictEqual(dbProduct.slug, targetSlug, 'dbProduct slug must match');
  assert(Array.isArray(dbProduct.images) && dbProduct.images.length > 0, 'dbProduct must have images');
  assert(Array.isArray(dbProduct.variants) && dbProduct.variants.length > 0, 'dbProduct must have variants');
  assert(Array.isArray(dbProduct.specifications) && dbProduct.specifications.length > 0, 'dbProduct must have specifications');
  console.log(`[PASS] 8. getDbProductBySlug('${targetSlug}') returned full product record.`);

  // 9. getDbFeaturedProducts()
  const featuredProds = await getDbFeaturedProducts(4);
  assert(Array.isArray(featuredProds), 'getDbFeaturedProducts must return array');
  assert(featuredProds.length > 0 && featuredProds.length <= 4, 'Must return up to 4 featured products');
  console.log(`[PASS] 9. getDbFeaturedProducts(4) returned ${featuredProds.length} products.`);

  // 10. getDynamicServices()
  const services = await getDynamicServices();
  assert(Array.isArray(services), 'Services must be an array');
  assert(services.length > 0, 'Must return services');
  console.log(`[PASS] 10. getDynamicServices() returned ${services.length} services.`);

  // 11. getDynamicCategoryDiscovery()
  const discovery = await getDynamicCategoryDiscovery();
  assert(Array.isArray(discovery), 'Discovery categories must be an array');
  assert(discovery.length > 0, 'Discovery categories must not be empty');
  console.log(`[PASS] 11. getDynamicCategoryDiscovery() returned ${discovery.length} discovery categories.`);

  console.log('\nAll 11 legacy forwarder regression checks passed successfully!');
}

runTests().catch((err) => {
  console.error('\nLegacy forwarders regression test failed:', err);
  process.exit(1);
});
