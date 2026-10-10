import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');

const standardProds = db.prepare("SELECT id, name, category_id, product_type, pricing_type, base_price, starting_price, custom_made, custom_measurement_available FROM products WHERE product_type = 'standard' LIMIT 5").all();
console.log('Standard products:', standardProds);

const customProds = db.prepare("SELECT id, name, category_id, product_type, pricing_type, base_price, starting_price, custom_made, custom_measurement_available FROM products WHERE product_type = 'custom_made' LIMIT 5").all();
console.log('Custom products:', customProds);

db.close();
