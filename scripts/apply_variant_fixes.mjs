// scripts/apply_variant_fixes.mjs
// Deactivates the 4 colour variants on prod-curt-1 (Blackout Curtains umbrella).
// These colours are now represented as individual dedicated products (1b/1c/1d).
// prod-curt-1 becomes a "browse blackout styles" page with no variant selector.
// Does NOT delete any data — only marks variants as inactive (active=0).

import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/zaira.db');

const VARIANTS_TO_DEACTIVATE = ['var-blk-navy', 'var-blk-beige', 'var-blk-oatmeal', 'var-blk-grey'];

console.log('=== APPLYING VARIANT FIX ===\n');

// Verify each variant exists and belongs to prod-curt-1 before touching
for (const vid of VARIANTS_TO_DEACTIVATE) {
  const v = db.prepare("SELECT id, name, product_id, active FROM product_variants WHERE id = ?").get(vid);
  if (!v) {
    console.error('ABORT: variant not found: ' + vid);
    process.exit(1);
  }
  if (v.product_id !== 'prod-curt-1') {
    console.error('ABORT: variant ' + vid + ' does not belong to prod-curt-1, belongs to: ' + v.product_id);
    process.exit(1);
  }
  console.log('Verified: ' + v.id + ' | ' + v.name + ' | product_id=' + v.product_id + ' | currently active=' + v.active);
}

console.log('\nDeactivating...');
for (const vid of VARIANTS_TO_DEACTIVATE) {
  const result = db.prepare("UPDATE product_variants SET active = 0 WHERE id = ? AND product_id = 'prod-curt-1'").run(vid);
  console.log('  ' + vid + ': changes=' + result.changes);
}

// Verify post-fix state
console.log('\n=== POST-FIX STATE ===');
const allVars = db.prepare("SELECT id, name, active FROM product_variants WHERE product_id = 'prod-curt-1' ORDER BY display_order").all();
console.log('prod-curt-1 variants after fix:');
allVars.forEach(v => console.log('  ' + v.id + ' | ' + v.name + ' | active=' + v.active));

const activeCount = allVars.filter(v => v.active === 1).length;
console.log('\nActive variant count: ' + activeCount + ' (expected: 0 — selector will be hidden)');

if (activeCount !== 0) {
  console.error('ERROR: Expected 0 active variants!');
  process.exit(1);
}

console.log('\n✅ Fix applied. prod-curt-1 (Blackout Curtains) now has 0 active variants. Selector hidden.');
db.close();
