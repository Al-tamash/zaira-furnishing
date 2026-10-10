import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');
db.exec('PRAGMA foreign_keys = OFF;');

// 1. Remove phantom Official Collection Items
const r1 = db.prepare("DELETE FROM products WHERE name = 'Official Collection Item'").run();
console.log('Deleted phantom Official Collection Items:', r1.changes);

// 2. Remove test products
const r2 = db.prepare("DELETE FROM products WHERE id LIKE '%test%' OR slug LIKE '%test%'").run();
console.log('Deleted test products:', r2.changes);

// 3. Remove fake categories (rugs-carpets, aliases)
const r3 = db.prepare("DELETE FROM categories WHERE id = 'rugs-carpets' OR slug = 'rugs-carpets' OR slug LIKE '%-alias'").run();
console.log('Deleted fake categories:', r3.changes);

// 4. Remove orphan variants
const r4 = db.prepare("DELETE FROM product_variants WHERE product_id NOT IN (SELECT id FROM products)").run();
console.log('Deleted orphan variants:', r4.changes);

// 5. Remove orphan images
const r5 = db.prepare("DELETE FROM product_images WHERE product_id NOT IN (SELECT id FROM products)").run();
console.log('Deleted orphan images:', r5.changes);

// 6. Remove orphan specs
const r6 = db.prepare("DELETE FROM product_specifications WHERE product_id NOT IN (SELECT id FROM products)").run();
console.log('Deleted orphan specs:', r6.changes);

db.exec('PRAGMA foreign_keys = ON;');
console.log('Cleanup finished successfully.');
