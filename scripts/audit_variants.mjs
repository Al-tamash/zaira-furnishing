// scripts/audit_variants.mjs
// Full audit: all active products + their actual variants from local SQLite
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');

// All active products with category
const products = db.prepare(`
  SELECT p.id, p.name, p.slug, p.product_type, c.name as category, c.slug as cat_slug
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE p.active = 1
  ORDER BY c.name, p.name
`).all();

console.log('=== ACTIVE PRODUCTS: ' + products.length + ' ===\n');

for (const p of products) {
  const variants = db.prepare(`
    SELECT id, name, variant_type, color_hex, price_adjustment, in_stock, active
    FROM product_variants
    WHERE product_id = ?
    ORDER BY display_order, name
  `).all(p.id);

  const activeVariants = variants.filter(v => v.active === 1);
  const inactiveVariants = variants.filter(v => v.active !== 1);

  const variantNames = activeVariants.map(v => v.name).join(', ') || '(none)';

  console.log('[' + p.id + '] ' + p.name);
  console.log('  Category: ' + p.category + ' (' + p.cat_slug + ')');
  console.log('  Type: ' + p.product_type);
  console.log('  Active variants (' + activeVariants.length + '): ' + variantNames);
  if (inactiveVariants.length > 0) {
    console.log('  Inactive variants (' + inactiveVariants.length + '): ' + inactiveVariants.map(v => v.name).join(', '));
  }
  console.log('');
}

// Curtain-specific deep check
console.log('=== CURTAIN PRODUCTS DETAILED CHECK ===');
const curtainProds = db.prepare(`
  SELECT p.id, p.name, p.slug FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE c.slug = 'curtains-drapes' AND p.active = 1
  ORDER BY p.display_order
`).all();

curtainProds.forEach(p => {
  const vars = db.prepare(`
    SELECT name, active, variant_type, color_hex FROM product_variants
    WHERE product_id = ?
    ORDER BY display_order, name
  `).all(p.id);
  console.log(p.id + ' (' + p.name + '):');
  vars.forEach(v => console.log('  - ' + v.name + ' [active=' + v.active + ', type=' + v.variant_type + ']'));
  if (vars.length === 0) console.log('  (no variants)');
});

// Active category count
const cats = db.prepare(`SELECT id, name, slug FROM categories WHERE active = 1 ORDER BY display_order`).all();
console.log('\n=== ACTIVE CATEGORIES: ' + cats.length + ' ===');
cats.forEach(c => console.log('  ' + c.slug + ': ' + c.name));

// Products per category
console.log('\n=== PRODUCTS PER CATEGORY ===');
cats.forEach(c => {
  const count = db.prepare(`SELECT COUNT(*) as cnt FROM products WHERE category_id = ? AND active = 1`).get(c.id);
  console.log('  ' + c.name + ': ' + count.cnt + ' active products');
});

db.close();
