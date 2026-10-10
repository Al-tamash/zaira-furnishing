// scripts/schema_check.mjs
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/zaira.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

const varCols = db.prepare("PRAGMA table_info(product_variants)").all();
console.log('\nproduct_variants columns:', varCols.map(c => c.name).join(', '));

const pCols = db.prepare("PRAGMA table_info(products)").all();
console.log('products columns:', pCols.map(c => c.name).join(', '));

db.close();
