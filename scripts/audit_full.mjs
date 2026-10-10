// scripts/audit_full.mjs
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/zaira.db');

const products = db.prepare(`
  SELECT p.id, p.name, p.slug, p.product_type, p.active, c.name as category, c.slug as cat_slug
  FROM products p
  JOIN categories c ON p.category_id = c.id
  WHERE p.active = 1
  ORDER BY c.name, p.display_order, p.name
`).all();

console.log('TOTAL ACTIVE PRODUCTS: ' + products.length + '\n');

let issues = [];

for (const p of products) {
  const variants = db.prepare(`
    SELECT id, name, variant_type, active
    FROM product_variants
    WHERE product_id = ?
    ORDER BY display_order, name
  `).all(p.id);

  const active = variants.filter(v => v.active === 1);
  const inactive = variants.filter(v => v.active !== 1);

  let rule = '';
  if (active.length <= 1) rule = 'HIDE selector';
  else rule = 'SHOW selector (' + active.length + ' options)';

  const row = p.id.padEnd(30) + ' | ' + (p.name).substring(0,40).padEnd(42) + ' | active_v=' + active.length + ' | ' + rule;
  console.log(row);

  // Flag potential issues
  if (active.length > 1 && p.cat_slug === 'curtains-drapes') {
    // Check: are these all legitimately for this product?
    const names = active.map(v => v.name);
    issues.push('MULTI-VARIANT CURTAIN: ' + p.id + ' (' + p.name + ') => ' + names.join(' | '));
  }
}

console.log('\n=== POTENTIAL ISSUES ===');
if (issues.length === 0) console.log('None found.');
issues.forEach(i => console.log(i));

// Check for the prod-curt-1 specifically - is it supposed to be a "parent" grouping?
console.log('\n=== prod-curt-1 DEEP CHECK ===');
const p1 = db.prepare(`SELECT id, name, slug, active, display_order FROM products WHERE id = 'prod-curt-1'`).get();
console.log(JSON.stringify(p1));
const p1vars = db.prepare(`SELECT id, name, variant_type, active FROM product_variants WHERE product_id = 'prod-curt-1' ORDER BY display_order`).all();
console.log('Variants:', JSON.stringify(p1vars, null, 2));

// Is there something in the screenshot slug we need to check?
console.log('\n=== ALL BLACKOUT-RELATED PRODUCTS ===');
const blackout = db.prepare(`SELECT id, name, slug, active FROM products WHERE name LIKE '%Blackout%' OR slug LIKE '%blackout%' ORDER BY id`).all();
blackout.forEach(b => {
  const vars = db.prepare(`SELECT name, active FROM product_variants WHERE product_id = ? ORDER BY display_order`).all(b.id);
  console.log(b.id + ' | active=' + b.active + ' | ' + b.name);
  console.log('  slug: ' + b.slug);
  vars.forEach(v => console.log('  variant: ' + v.name + ' [active=' + v.active + ']'));
});

db.close();
