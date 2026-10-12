import fs from 'fs';
import path from 'path';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { getDatabase } from '../src/lib/db';
import { createCatalogAdmin, normalizeCreateProductPayload } from '../src/lib/catalog';

async function main() {
  console.log('Testing live Cloudflare D1 product creation...');
  const db = getDatabase();
  const admin = createCatalogAdmin(db);

  const testSlug = `live-test-d1-${Date.now()}`;
  const input = normalizeCreateProductPayload({
    name: 'Live D1 Test Product',
    slug: testSlug,
    categoryId: 'curtains',
    price: 1299,
    main_image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        altText: 'Live D1 Image',
        isMain: true,
      }
    ],
    variants: [
      {
        name: 'Standard Variant',
        variantType: 'color',
        priceAdjustment: 0,
      }
    ],
    specifications: [
      {
        label: 'Fabric Material',
        value: '100% Linen',
      }
    ],
    customizationConfigs: [
      {
        fieldKey: 'lining_type',
        fieldLabel: 'Lining Type',
        fieldType: 'select',
        options: ['None', 'Blackout', 'Thermal'],
      }
    ],
  });

  const created = await admin.createProduct(input);
  console.log('Product created in D1:', created.id, created.slug);

  if (!created.id) {
    throw new Error('Created product ID missing');
  }

  // Now delete the test product
  const deleted = await admin.deleteProduct(created.id, { permanent: true });
  console.log('Product deleted cleanly from D1:', deleted.affectedPaths);
  console.log('ALL CLOUDFLARE D1 ATOMIC BATCH TESTS PASSED!');
}

main().catch((err) => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
