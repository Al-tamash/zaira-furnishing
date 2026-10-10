import { getDatabase } from '../src/lib/db';

async function main() {
  const db = getDatabase();
  const products = await db.query<{ id: string; name: string; category_id: string; subcategory_id: string }>(
    'SELECT p.id, p.name, p.category_id, p.subcategory_id FROM products p ORDER BY p.category_id, p.display_order'
  );
  console.log(`Total products in DB: ${products.length}`);
  for (const p of products) {
    console.log(`[${p.category_id}] ${p.name} (${p.id})`);
  }
}

main().catch(console.error);
