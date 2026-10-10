import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');
const BASE_URL = 'http://localhost:3000';

async function runDynamicTests() {
  console.log('=== RUNNING DYNAMIC VERIFICATION TESTS ===\n');

  // ──────────────────────────────────────────────────────────────────────────
  // Test A: New Curtain Product (D1 -> Listing -> Product Detail)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- TEST A: New Curtain Product ---');
  const testSubSlug = 'sheer';
  const testProdSlug = 'warm-champagne-luxe-voile-curtains';

  const listingRes = await fetch(`${BASE_URL}/categories/curtains/${testSubSlug}`);
  const listingHtml = await listingRes.text();
  const listingHasProd = listingHtml.includes('Warm Champagne Luxe Voile Curtains') || listingHtml.includes(testProdSlug);
  console.log(`Curtain listing (/categories/curtains/${testSubSlug}) status: ${listingRes.status}`);
  console.log(`Listing contains new product: ${listingHasProd ? 'PASS' : 'FAIL'}`);

  const detailRes = await fetch(`${BASE_URL}/products/${testProdSlug}`);
  const detailHtml = await detailRes.text();
  const detailHasName = detailHtml.includes('Warm Champagne Luxe Voile Curtains');
  const detailHasPrice = detailHtml.includes('2,650');
  console.log(`Product detail (/products/${testProdSlug}) status: ${detailRes.status}`);
  console.log(`Detail contains product name: ${detailHasName ? 'PASS' : 'FAIL'}`);
  console.log(`Detail contains product price ₹2,650: ${detailHasPrice ? 'PASS' : 'FAIL'}`);

  // ──────────────────────────────────────────────────────────────────────────
  // Test B: Dynamic Product Name Change
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST B: Product Name Dynamic Verification ---');
  const originalName = 'Warm Champagne Luxe Voile Curtains';
  const tempName = 'TEST_DYNAMIC_NAME_CHAMPAGNE_VOILE';

  db.prepare("UPDATE products SET name = ?, display_name = ? WHERE slug = ?").run(tempName, tempName, testProdSlug);
  console.log(`Updated product name in D1 to "${tempName}"`);

  const nameCheckRes = await fetch(`${BASE_URL}/products/${testProdSlug}`, { cache: 'no-store' });
  const nameCheckHtml = await nameCheckRes.text();
  const nameReflected = nameCheckHtml.includes(tempName);
  console.log(`Product detail reflects changed name from D1: ${nameReflected ? 'PASS' : 'FAIL'}`);

  // Restore original name
  db.prepare("UPDATE products SET name = ?, display_name = ? WHERE slug = ?").run(originalName, originalName, testProdSlug);
  console.log(`Restored product name in D1 to "${originalName}"`);

  // ──────────────────────────────────────────────────────────────────────────
  // Test C: Dynamic Product Price Change
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST C: Product Price Dynamic Verification ---');
  const originalPrice = 2650;
  const tempPrice = 7777;

  db.prepare("UPDATE products SET base_price = ? WHERE slug = ?").run(tempPrice, testProdSlug);
  console.log(`Updated product price in D1 to ₹${tempPrice}`);

  const priceCheckRes = await fetch(`${BASE_URL}/products/${testProdSlug}`, { cache: 'no-store' });
  const priceCheckHtml = await priceCheckRes.text();
  const priceReflected = priceCheckHtml.includes('7,777');
  console.log(`Product detail reflects changed price from D1: ${priceReflected ? 'PASS' : 'FAIL'}`);

  // Restore original price
  db.prepare("UPDATE products SET base_price = ? WHERE slug = ?").run(originalPrice, testProdSlug);
  console.log(`Restored product price in D1 to ₹${originalPrice}`);

  // ──────────────────────────────────────────────────────────────────────────
  // Test D: Dynamic Product Activation / Deactivation
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST D: Product Activation / Deactivation ---');
  db.prepare("UPDATE products SET active = 0 WHERE slug = ?").run(testProdSlug);
  console.log(`Deactivated product ${testProdSlug} (active = 0) in D1`);

  const deactRes = await fetch(`${BASE_URL}/categories/curtains/${testSubSlug}`, { cache: 'no-store' });
  const deactHtml = await deactRes.text();
  const disappearsFromListing = !deactHtml.includes('Warm Champagne Luxe Voile Curtains');
  console.log(`Deactivated product disappears from active listing: ${disappearsFromListing ? 'PASS' : 'FAIL'}`);

  const deactDetailRes = await fetch(`${BASE_URL}/products/${testProdSlug}`, { cache: 'no-store' });
  console.log(`Deactivated product detail returns 404: ${deactDetailRes.status === 404 ? 'PASS' : 'FAIL'} (status: ${deactDetailRes.status})`);

  // Restore active
  db.prepare("UPDATE products SET active = 1 WHERE slug = ?").run(testProdSlug);
  console.log(`Re-activated product ${testProdSlug} (active = 1) in D1`);

  const reactListingRes = await fetch(`${BASE_URL}/categories/curtains/${testSubSlug}`, { cache: 'no-store' });
  const reactListingHtml = await reactListingRes.text();
  const reappearsInListing = reactListingHtml.includes('Warm Champagne Luxe Voile Curtains');
  console.log(`Re-activated product reappears in active listing: ${reappearsInListing ? 'PASS' : 'FAIL'}`);

  // ──────────────────────────────────────────────────────────────────────────
  // Test E: Subcategory Isolation (Sheer ≠ Velvet, Velvet ≠ Satin)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- TEST E: Subcategory Isolation ---');
  const sheerPageRes = await fetch(`${BASE_URL}/categories/curtains/sheer`);
  const sheerPageHtml = await sheerPageRes.text();
  const sheerHasVelvet = sheerPageHtml.includes('Royal Emerald Heavyweight Matte Velvet Drapes') || sheerPageHtml.includes('Prussian Midnight Acoustic Velvet Curtains');
  const sheerHasBlackout = sheerPageHtml.includes('Dove Grey Triple-Weave Blackout Curtain');
  console.log(`Sheer listing does NOT contain Velvet products: ${!sheerHasVelvet ? 'PASS' : 'FAIL'}`);
  console.log(`Sheer listing does NOT contain Blackout products: ${!sheerHasBlackout ? 'PASS' : 'FAIL'}`);

  const velvetPageRes = await fetch(`${BASE_URL}/categories/curtains/velvet`);
  const velvetPageHtml = await velvetPageRes.text();
  const velvetHasSatin = velvetPageHtml.includes('Pearl Lustre Fluid Plain Satin Curtains') || velvetPageHtml.includes('Champagne Elegance Heavy Sateen Curtains');
  const velvetHasSheer = velvetPageHtml.includes('Ivory Mist Light-Filtering Sheer Curtains');
  console.log(`Velvet listing does NOT contain Satin products: ${!velvetPageHtml.includes('Pearl Lustre') ? 'PASS' : 'FAIL'}`);
  console.log(`Velvet listing does NOT contain Sheer products: ${!velvetHasSheer ? 'PASS' : 'FAIL'}`);

  console.log('\n=== ALL DYNAMIC VERIFICATION TESTS COMPLETED ===');
}

runDynamicTests()
  .catch(console.error)
  .finally(() => db.close());
