const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/zaira.db');

console.log('=== DATABASE VERIFICATION REPORT ===');
const quoteTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='quote_requests'").all();
console.log('quote_requests table exists:', quoteTable.length > 0);

const measTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='measurement_requests'").all();
console.log('measurement_requests table exists:', measTable.length > 0);

const indexes = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND (tbl_name='quote_requests' OR tbl_name='measurement_requests')").all();
console.log('indexes count:', indexes.length);
indexes.forEach(idx => console.log(`  - ${idx.name} on ${idx.tbl_name}`));

const productsTotal = db.prepare("SELECT COUNT(*) as c FROM products").get();
const productsActive = db.prepare("SELECT COUNT(*) as c FROM products WHERE active = 1").get();
console.log('products total:', productsTotal.c, '| active:', productsActive.c);

const ordersTotal = db.prepare("SELECT COUNT(*) as c FROM orders").get();
console.log('orders total:', ordersTotal.c);

const categoriesTotal = db.prepare("SELECT COUNT(*) as c FROM categories").get();
console.log('categories total:', categoriesTotal.c);

const curtainsCheck = db.prepare("SELECT id, name, active FROM products WHERE id IN ('prod-curt-1b', 'prod-curt-1c', 'prod-curt-1d')").all();
console.log('Stage 1 curtain cleanup products intact (inactive):', curtainsCheck);
