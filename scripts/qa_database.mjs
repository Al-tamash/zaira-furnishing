// scripts/qa_database.mjs
// Full database integrity audit for Zaira Furnishing QA
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/zaira.db');

let passed = 0;
let failed = 0;
const issues = [];

function check(label, condition, detail = '') {
  if (condition) {
    console.log('  ✅ PASS: ' + label);
    passed++;
  } else {
    console.log('  ❌ FAIL: ' + label + (detail ? ' — ' + detail : ''));
    failed++;
    issues.push(label + (detail ? ': ' + detail : ''));
  }
}

// ─── CATEGORIES ───
console.log('\n=== CATEGORIES ===');
const cats = db.prepare("SELECT * FROM categories ORDER BY display_order").all();
const activeCats = cats.filter(c => c.active === 1);
const inactiveCats = cats.filter(c => c.active !== 1);
check('Active category count = 9', activeCats.length === 9, 'actual: ' + activeCats.length);
console.log('  Active:', activeCats.map(c => c.slug).join(', '));
console.log('  Inactive (' + inactiveCats.length + '):', inactiveCats.map(c => c.slug).join(', '));

// Check expected slugs
const expectedSlugs = ['curtains-drapes','window-blinds-shades','sofa-fabrics-upholstery',
  'wallpapers-wall-coverings','mattresses-sleep-systems','carpets-rugs',
  'wooden-flooring-sports-floor','bed-linen-bath','cushions-pillows'];
for (const slug of expectedSlugs) {
  check('Category exists: ' + slug, activeCats.some(c => c.slug === slug));
}

// ─── PRODUCTS ───
console.log('\n=== PRODUCTS ===');
const allProducts = db.prepare("SELECT * FROM products ORDER BY display_order").all();
const activeProducts = allProducts.filter(p => p.active === 1);
const inactiveProducts = allProducts.filter(p => p.active !== 1);
check('Active product count = 45', activeProducts.length === 45, 'actual: ' + activeProducts.length);
console.log('  Inactive products (' + inactiveProducts.length + ')');

// Check for duplicate slugs
const slugs = activeProducts.map(p => p.slug);
const uniqueSlugs = new Set(slugs);
check('No duplicate product slugs', uniqueSlugs.size === slugs.length, 'duplicates: ' + (slugs.length - uniqueSlugs.size));

// Check every product has a category
const noCategory = activeProducts.filter(p => {
  const cat = db.prepare("SELECT id FROM categories WHERE id = ? AND active = 1").get(p.category_id);
  return !cat;
});
check('All active products have active category', noCategory.length === 0, 'orphaned: ' + noCategory.map(p=>p.id).join(', '));

// ─── PRODUCT VARIANTS ───
console.log('\n=== PRODUCT VARIANTS ===');
const allVariants = db.prepare("SELECT * FROM product_variants").all();
const activeVariants = allVariants.filter(v => v.active === 1);

// Check variants belong to active products
const orphanVariants = activeVariants.filter(v => {
  const prod = db.prepare("SELECT id FROM products WHERE id = ? AND active = 1").get(v.product_id);
  return !prod;
});
check('No active variants orphaned from inactive products', orphanVariants.length === 0, 'orphaned: ' + orphanVariants.map(v=>v.id).join(', '));

// Products with 2+ active variants (should show selector)
const productVariantCounts = {};
activeVariants.forEach(v => {
  productVariantCounts[v.product_id] = (productVariantCounts[v.product_id] || 0) + 1;
});
const multiVariantProducts = Object.entries(productVariantCounts).filter(([,cnt]) => cnt > 1);
console.log('  Products with 2+ active variants (' + multiVariantProducts.length + '):');
multiVariantProducts.forEach(([pid, cnt]) => {
  const p = db.prepare("SELECT name FROM products WHERE id = ?").get(pid);
  const vars = db.prepare("SELECT name FROM product_variants WHERE product_id = ? AND active = 1").all(pid);
  console.log('    ' + pid + ' (' + (p && p.name) + '): ' + vars.map(v=>v.name).join(' | '));
});

// prod-curt-1 specific check (should now have 0 active variants)
const curt1Vars = db.prepare("SELECT name, active FROM product_variants WHERE product_id = 'prod-curt-1' AND active = 1").all();
check('prod-curt-1 has 0 active variants', curt1Vars.length === 0, 'has: ' + curt1Vars.map(v=>v.name).join(', '));

// ─── PRODUCT IMAGES ───
console.log('\n=== PRODUCT IMAGES ===');
const activeImages = db.prepare("SELECT * FROM product_images WHERE active = 1").all();
const orphanImages = activeImages.filter(img => {
  const prod = db.prepare("SELECT id FROM products WHERE id = ?").get(img.product_id);
  return !prod;
});
check('No orphaned product images', orphanImages.length === 0, 'count: ' + orphanImages.length);

// Every active product has at least 1 image
const productsWithNoImage = activeProducts.filter(p => {
  const img = db.prepare("SELECT id FROM product_images WHERE product_id = ? AND active = 1 LIMIT 1").get(p.id);
  return !img;
});
check('All active products have at least 1 image', productsWithNoImage.length === 0,
  'missing: ' + productsWithNoImage.map(p => p.id).join(', '));

// ─── ORDERS / CART / WISHLIST / NOTIFICATIONS ───
console.log('\n=== TRANSACTIONAL TABLES ===');
const orderCount = db.prepare("SELECT COUNT(*) as cnt FROM orders").get();
console.log('  Orders in DB: ' + orderCount.cnt);
const cartCount = db.prepare("SELECT COUNT(*) as cnt FROM carts").get();
console.log('  Carts: ' + cartCount.cnt);
const wishlistCount = db.prepare("SELECT COUNT(*) as cnt FROM wishlist_items").get();
console.log('  Wishlist items: ' + wishlistCount.cnt);
const notifCount = db.prepare("SELECT COUNT(*) as cnt FROM order_notifications").get();
console.log('  Order notifications: ' + notifCount.cnt);
const quoteCount = db.prepare("SELECT COUNT(*) as cnt FROM quote_requests").get();
console.log('  Quote requests: ' + quoteCount.cnt);
const measCount = db.prepare("SELECT COUNT(*) as cnt FROM measurement_requests").get();
console.log('  Measurement requests: ' + measCount.cnt);
const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get();
console.log('  Users: ' + userCount.cnt);

// ─── TABLE EXISTENCE ───
console.log('\n=== TABLE EXISTENCE ===');
const requiredTables = ['categories','products','product_variants','product_images',
  'product_specifications','customer_sessions','carts','cart_items','wishlist_items',
  'orders','order_items','order_notifications','quote_requests','measurement_requests',
  'users','services','cms_content','subcategories'];
const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
for (const t of requiredTables) {
  check('Table exists: ' + t, existingTables.includes(t));
}

// ─── FOREIGN KEY INTEGRITY ───
console.log('\n=== FOREIGN KEY INTEGRITY ===');
const orphanCartItems = db.prepare(`
  SELECT ci.id FROM cart_items ci
  LEFT JOIN carts c ON ci.cart_id = c.id
  WHERE c.id IS NULL
`).all();
check('No orphaned cart_items', orphanCartItems.length === 0, 'count: ' + orphanCartItems.length);

const orphanOrderItems = db.prepare(`
  SELECT oi.id FROM order_items oi
  LEFT JOIN orders o ON oi.order_id = o.id
  WHERE o.id IS NULL
`).all();
check('No orphaned order_items', orphanOrderItems.length === 0, 'count: ' + orphanOrderItems.length);

// ─── CUSTOM PRODUCT TYPES ───
console.log('\n=== PRODUCT TYPES ===');
const customProds = activeProducts.filter(p => p.product_type === 'custom_made');
const standardProds = activeProducts.filter(p => p.product_type === 'standard');
console.log('  Standard products: ' + standardProds.length);
console.log('  Custom/made-to-measure products: ' + customProds.length);
check('All products have valid product_type', activeProducts.every(p => ['standard','custom_made'].includes(p.product_type)));

// ─── PRODUCTS PER CATEGORY ───
console.log('\n=== PRODUCTS PER CATEGORY ===');
for (const cat of activeCats) {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM products WHERE category_id = ? AND active = 1").get(cat.id);
  console.log('  ' + cat.name + ': ' + count.cnt);
  check(cat.name + ' has > 0 products', count.cnt > 0, 'has ' + count.cnt);
}

// ─── SUMMARY ───
console.log('\n=== DB AUDIT SUMMARY ===');
console.log('PASSED: ' + passed);
console.log('FAILED: ' + failed);
if (issues.length > 0) {
  console.log('ISSUES:');
  issues.forEach(i => console.log('  - ' + i));
} else {
  console.log('NO ISSUES FOUND');
}

db.close();
