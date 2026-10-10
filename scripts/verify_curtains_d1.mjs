import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');

console.log('=== CURTAIN SUBCATEGORIES & PRODUCT COUNTS ===');
const subcategories = db.prepare("SELECT id, name, slug, display_order FROM subcategories WHERE category_id = 'cat-1' ORDER BY display_order").all();

for (const sub of subcategories) {
  const prods = db.prepare("SELECT id, name, slug, product_type, base_price, active FROM products WHERE category_id = 'cat-1' AND subcategory_id = ? ORDER BY display_order").all(sub.id);
  console.log(`\nSubcategory: ${sub.name} (slug: ${sub.slug}, id: ${sub.id}) - ${prods.length} products:`);
  for (const p of prods) {
    const imgCount = db.prepare("SELECT COUNT(*) as c FROM product_images WHERE product_id = ?").get(p.id).c;
    const varCount = db.prepare("SELECT COUNT(*) as c FROM product_variants WHERE product_id = ?").get(p.id).c;
    const specCount = db.prepare("SELECT COUNT(*) as c FROM product_specifications WHERE product_id = ?").get(p.id).c;
    console.log(`  - [${p.id}] ${p.name} | slug: ${p.slug} | Type: ${p.product_type} | Price: ₹${p.base_price} | Active: ${p.active} | Imgs: ${imgCount} | Vars: ${varCount} | Specs: ${specCount}`);
  }
}

db.close();
