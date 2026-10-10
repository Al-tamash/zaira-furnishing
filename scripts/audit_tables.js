const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/zaira.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
console.log('TABLE NAME'.padEnd(32), 'ROW COUNT');
console.log('='.repeat(45));
for (const t of tables) {
  try {
    const row = db.prepare(`SELECT count(1) as c FROM "${t.name}"`).get();
    console.log(t.name.padEnd(32), row.c);
  } catch (e) {
    console.log(t.name.padEnd(32), 'ERROR: ' + e.message);
  }
}
