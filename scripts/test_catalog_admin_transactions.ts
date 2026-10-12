import { getDatabase } from '../src/lib/db';
import { createCatalogAdmin } from '../src/lib/catalog/admin-engine';
import { ProductNotFoundError } from '../src/lib/catalog/admin-types';

async function run() {
  console.log('Testing Catalog Admin Transaction Isolation & Atomic Rollback...');
  const db = getDatabase();
  const admin = createCatalogAdmin(db);

  const testSlug = `tx-test-${Date.now().toString().slice(-5)}`;

  // Test 1: Atomic Creation
  const createRes = await admin.createProduct({
    name: 'Transaction Isolation Test Drape',
    slug: testSlug,
    categoryId: 'curtains-drapes',
    price: 3200,
    images: [
      { url: '/img/tx1.jpg', isMain: true },
      { url: '/img/tx2.jpg', isMain: false },
    ],
    variants: [
      { name: 'Opal White', variantType: 'color', priceAdjustment: 0 },
      { name: 'Champagne Gold', variantType: 'color', priceAdjustment: 400 },
    ],
    specifications: [
      { label: 'Weave', value: 'Jacquard' },
    ],
    customizationConfigs: [
      { fieldKey: 'pleat_style', fieldLabel: 'Pleat Style', fieldType: 'select', options: ['Pinch', 'Ripplefold'] },
    ],
  });

  if (!createRes.success || !createRes.id) {
    throw new Error('Atomic product creation failed');
  }
  const prodId = createRes.id;
  console.log(`✓ Product created atomically with ID: ${prodId}`);

  // Verify all child rows exist
  const [imgs, vars, specs, cfgs] = await Promise.all([
    db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_specifications WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM customization_configs WHERE product_id = ?', [prodId]),
  ]);

  if (imgs.length !== 2) throw new Error(`Expected 2 images, got ${imgs.length}`);
  if (vars.length !== 2) throw new Error(`Expected 2 variants, got ${vars.length}`);
  if (specs.length !== 1) throw new Error(`Expected 1 spec, got ${specs.length}`);
  if (cfgs.length !== 1) throw new Error(`Expected 1 config, got ${cfgs.length}`);
  console.log('✓ All 6 relational rows verified in database');

  // Test 2: Atomic Update
  const updateRes = await admin.updateProduct(prodId, {
    price: 3500,
    images: [{ url: '/img/updated-main.jpg', isMain: true }],
    variants: [{ name: 'Solo Variant', variantType: 'material' }],
  });
  if (!updateRes.success) throw new Error('Update failed');

  const updatedImgs = await db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]);
  const updatedVars = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]);
  if (updatedImgs.length !== 1 || (updatedImgs[0] as any).image_url !== '/img/updated-main.jpg') {
    throw new Error('Images were not atomically replaced');
  }
  if (updatedVars.length !== 1 || (updatedVars[0] as any).name !== 'Solo Variant') {
    throw new Error('Variants were not atomically replaced');
  }
  console.log('✓ Relational children atomically replaced on update');

  // Test 3: Transaction Rollback Proof (Batch Isolation)
  console.log('Verifying transaction rollback atomicity...');
  const rollbackId = `prod-rollback-${Date.now().toString().slice(-4)}`;
  let batchFailed = false;
  try {
    await db.batch([
      {
        sql: `INSERT INTO products (id, category_id, name, slug, base_price, active, created_at, updated_at)
              VALUES (?, 'curtains-drapes', 'Rollback Target', ?, 1000, 1, datetime('now'), datetime('now'))`,
        params: [rollbackId, `rollback-slug-${Date.now()}`],
      },
      {
        sql: 'INSERT INTO non_existent_table_designed_to_fail (col) VALUES (1)',
        params: [],
      },
    ]);
  } catch {
    batchFailed = true;
  }

  if (!batchFailed) {
    throw new Error('Expected batch to fail on invalid table');
  }

  const rolledBackRow = await db.queryOne('SELECT * FROM products WHERE id = ?', [rollbackId]);
  if (rolledBackRow) {
    throw new Error('CRITICAL FAILURE: Product row was NOT rolled back!');
  }
  console.log('✓ Transaction rollback verified: 0 partial writes on batch failure');

  // Test 4: Permanent Cascade Delete
  await admin.deleteProduct(prodId, { permanent: true });
  const [deletedProd, remImgs, remVars] = await Promise.all([
    db.queryOne('SELECT * FROM products WHERE id = ?', [prodId]),
    db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]),
  ]);
  if (deletedProd !== null || remImgs.length > 0 || remVars.length > 0) {
    throw new Error('Permanent cascade deletion failed');
  }
  console.log('✓ Permanent cascade delete verified: zero orphaned records');

  console.log('ALL TRANSACTION ENGINE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
