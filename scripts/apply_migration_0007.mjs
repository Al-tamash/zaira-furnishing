import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');
const sql = fs.readFileSync('migrations/0007_customer_reviews.sql', 'utf8');
db.exec(sql);

const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='product_reviews'").get();
console.log('Migration applied. Found table:', table);

const cols = db.prepare('PRAGMA table_info(product_reviews)').all();
console.log('Columns:', cols.map(c => c.name).join(', '));

db.close();
