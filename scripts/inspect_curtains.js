const { getDb } = require('./src/lib/db');

const db = getDb();

console.log('=== CATEGORIES ===');
const categories = db.prepare("SELECT * FROM categories WHERE slug LIKE '%curtain%' OR name LIKE '%curtain%'").all();
console.log(categories);

console.log('=== SUBCATEGORIES (cat-1) ===');
const subcategories = db.prepare("SELECT * FROM subcategories WHERE category_id = 'cat-1' ORDER BY display_order").all();
console.log(subcategories);

console.log('=== CURTAIN PRODUCTS ===');
const products = db.prepare("SELECT id, name, slug, subcategory_id, price, is_active FROM products WHERE category_id = 'cat-1'").all();
console.log(products);

for (const p of products) {
  console.log(`\n--- Product: ${p.name} (${p.slug}) ---`);
  const images = db.prepare("SELECT * FROM product_images WHERE product_id = ?").all(p.id);
  console.log('Images:', images);
  const variants = db.prepare("SELECT * FROM product_variants WHERE product_id = ?").all(p.id);
  console.log('Variants:', variants);
  const specs = db.prepare("SELECT * FROM product_specifications WHERE product_id = ?").all(p.id);
  console.log('Specifications:', specs);
}
