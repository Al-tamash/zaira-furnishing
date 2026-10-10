import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');

const subcategories = db.prepare("SELECT * FROM subcategories WHERE category_id = 'cat-1' ORDER BY display_order").all();

for (const sub of subcategories) {
  // Simulate getDynamicProducts query
  const sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug, s.slug as subcategory_slug, s.name as subcategory_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories s ON p.subcategory_id = s.id
    WHERE p.active = 1
      AND (p.category_id = 'cat-1' OR c.slug = 'curtains-drapes')
      AND (p.subcategory_id = ? OR s.slug = ?)
    ORDER BY p.display_order ASC
  `;
  const products = db.prepare(sql).all(sub.slug, sub.slug);

  console.log(`\n=== Route /categories/curtains/${sub.slug} ===`);
  console.log(`Curtain Type: ${sub.name}`);
  console.log(`Returned products count: ${products.length}`);
  for (const p of products) {
    const isCurtain = p.category_slug === 'curtains-drapes' || p.category_id === 'cat-1';
    const curtainType = isCurtain ? (p.subcategory_slug || p.subcategory_id) : undefined;
    const matchesFilter = (p.category_slug === 'curtains-drapes' || p.category_slug === 'curtains') &&
      (!sub.slug || curtainType === sub.slug || (curtainType && curtainType.toLowerCase() === sub.slug.toLowerCase()));
    console.log(`  - ${p.name} (slug: ${p.slug}) | curtainType: ${curtainType} | Matches CurtainTypePage filter: ${matchesFilter}`);
  }
}

db.close();
