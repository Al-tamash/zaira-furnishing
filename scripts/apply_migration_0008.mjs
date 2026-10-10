import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/zaira.db');
const sql = fs.readFileSync('migrations/0008_order_source.sql', 'utf8');
db.exec(sql);

const cols = db.prepare('PRAGMA table_info(orders)').all();
console.log('Columns in orders:', cols.map(c => c.name).join(', '));

const sample = db.prepare('SELECT id, order_number, order_source FROM orders LIMIT 3').all();
console.log('Sample rows:', sample);

db.close();
