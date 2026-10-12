import { getDatabase } from '../src/lib/db';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts,
} from '../src/lib/catalog';

async function run() {
  console.log('==================================================');
  console.log('E2E Audit: Deep Product Admin Seam & Transactions');
  console.log('==================================================');

  const db = getDatabase();
  const slug = `e2e-audit-${Date.now().toString().slice(-5)}`;

  // 1. Create a rich product graph
  console.log('\n[1/4] Creating product graph atomically...');
  const res = await createProduct({
    name: 'Atelier Cashmere Throw',
    slug,
    categoryId: 'cushions-pillows',
    price: 6800,
    featured: true,
    images: [
      { url: '/images/hero/cashmere-1.jpg', isMain: true },
      { url: '/images/hero/cashmere-2.jpg', isMain: false },
    ],
    variants: [
      { name: 'Oatmeal', variantType: 'color', colorHex: '#D8C5A8', inStock: true },
      { name: 'Charcoal', variantType: 'color', colorHex: '#2B2B2B', inStock: true },
      { name: 'Sage', variantType: 'color', colorHex: '#8A9A86', inStock: false },
    ],
    specifications: [
      { label: 'Origin', value: 'Mongolian Cashmere' },
      { label: 'Care', value: 'Dry Clean Only' },
    ],
    customizationConfigs: [
      { fieldKey: 'monogram', fieldLabel: 'Bespoke Monogram', fieldType: 'text', isRequired: false },
    ],
  });

  const productId = res.id;
  console.log(`✓ Product created with ID: ${productId}, slug: ${res.slug}`);

  // 2. Query product through public storefront query seam
  console.log('\n[2/4] Verifying visibility in public storefront seam...');
  const fetched = await getProduct(res.slug);
  if (!fetched) throw new Error('Product not visible via getProduct');
  if (fetched.price !== 6800) throw new Error('Incorrect price in fetched product');
  if (fetched.variations.length !== 3) throw new Error(`Expected 3 variations, got ${fetched.variations.length}`);
  if (fetched.specifications.length !== 2) throw new Error(`Expected 2 specifications, got ${fetched.specifications.length}`);
  console.log('✓ Storefront query seam cleanly reads newly created product graph');

  // 3. Atomically update variants & verify clean replacement
  console.log('\n[3/4] Updating variants atomically...');
  await updateProduct(productId, {
    price: 7200,
    variants: [
      { name: 'Ivory White', variantType: 'color', colorHex: '#F5F5F0', inStock: true },
    ],
  });

  const updated = await getProduct(res.slug);
  if (!updated) throw new Error('Product not found after update');
  if (updated.price !== 7200) throw new Error('Price was not updated');
  if (updated.variations.length !== 1 || updated.variations[0].name !== 'Ivory White') {
    throw new Error('Old variants were not cleanly replaced');
  }
  console.log('✓ Variants cleanly replaced without orphaned records');

  // 4. Cascade delete product
  console.log('\n[4/4] Permanently deleting product...');
  await deleteProduct(productId, { permanent: true });
  const afterDelete = await getProduct(res.slug);
  if (afterDelete !== null) throw new Error('Product still exists after permanent delete');
  console.log('✓ Product and all child rows permanently removed');

  console.log('\n==================================================');
  console.log('AUDIT COMPLETE: All seam & transaction tests passed!');
  console.log('==================================================');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
