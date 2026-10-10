// scripts/fix_variants.mjs
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/zaira.db');

console.log('=== PRE-FIX STATE ===\n');

const blackout = db.prepare(
  "SELECT id, name, slug, active FROM products WHERE slug LIKE '%blackout%' OR name LIKE '%Blackout%' ORDER BY id"
).all();
console.log('All blackout products:');
blackout.forEach(b => {
  const vars = db.prepare(
    "SELECT id, name, active FROM product_variants WHERE product_id = ? ORDER BY display_order"
  ).all(b.id);
  console.log('  ' + b.id + ' | active=' + b.active + ' | ' + b.name);
  vars.forEach(v => console.log('    variant: ' + v.id + ' | ' + v.name + ' | active=' + v.active));
});

const navyProd = db.prepare(
  "SELECT id, name, slug, active FROM products WHERE name LIKE '%Navy%' OR slug LIKE '%navy%'"
).all();
console.log('\nMidnight Navy dedicated products:');
navyProd.forEach(p => console.log('  ' + p.id + ' | ' + p.name + ' | active=' + p.active));

const p1 = db.prepare("SELECT display_order, name FROM products WHERE id='prod-curt-1'").get();
const p1b = db.prepare("SELECT display_order, name FROM products WHERE id='prod-curt-1b'").get();
const p1c = db.prepare("SELECT display_order, name FROM products WHERE id='prod-curt-1c'").get();
const p1d = db.prepare("SELECT display_order, name FROM products WHERE id='prod-curt-1d'").get();
console.log('\nDisplay orders:');
console.log('  prod-curt-1: order=' + (p1 && p1.display_order) + ' | ' + (p1 && p1.name));
console.log('  prod-curt-1b: order=' + (p1b && p1b.display_order) + ' | ' + (p1b && p1b.name));
console.log('  prod-curt-1c: order=' + (p1c && p1c.display_order) + ' | ' + (p1c && p1c.name));
console.log('  prod-curt-1d: order=' + (p1d && p1d.display_order) + ' | ' + (p1d && p1d.name));

db.close();
