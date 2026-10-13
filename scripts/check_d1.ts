import fs from 'fs';
import { getDatabase } from '../src/lib/db';

const envContent = fs.readFileSync('.env.local', 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function run() {
  const db = getDatabase();
  console.log('Active DB client:', db.constructor.name);
  const products = await db.query<{ id: string; slug: string; name: string; category_id: string }>(
    'SELECT id, slug, name, category_id FROM products'
  );
  console.log(`Total products in D1: ${products.length}`);
  for (const p of products) {
    console.log(`[${p.category_id}] ${p.slug} -> ${p.name}`);
  }
}

run().catch(console.error);
