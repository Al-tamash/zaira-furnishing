import {
  CreateProductInputSchema,
  UpdateProductInputSchema,
  DeleteProductOptionsSchema,
  ProductNotFoundError,
} from '../src/lib/catalog/admin-types';

async function run() {
  console.log('Testing Admin Zod Schemas...');

  // Test 1: Valid product creation schema
  const valid = CreateProductInputSchema.safeParse({
    name: 'Bespoke Velvet Drape',
    categoryId: 'curtains-drapes',
    price: 4500,
    images: [{ url: '/img/curtain.jpg', isMain: true }],
    variants: [{ name: 'Gold Sheen', variantType: 'color', priceAdjustment: 500 }],
  });
  if (!valid.success) {
    throw new Error('Valid payload failed to parse: ' + JSON.stringify(valid.error.issues));
  }
  console.log('✓ Valid create schema parsed successfully');

  // Test 2: Reject empty product name
  const emptyName = CreateProductInputSchema.safeParse({
    name: '',
    categoryId: 'curtains-drapes',
  });
  if (emptyName.success) {
    throw new Error('Should have rejected empty name');
  }
  console.log('✓ Correctly rejected empty name');

  // Test 3: Reject negative price
  const negativePrice = CreateProductInputSchema.safeParse({
    name: 'Curtain',
    categoryId: 'curtains-drapes',
    price: -100,
  });
  if (negativePrice.success) {
    throw new Error('Should have rejected negative price');
  }
  console.log('✓ Correctly rejected negative price');

  // Test 4: Error instantiation
  const err = new ProductNotFoundError('prod-123');
  if (err.name !== 'ProductNotFoundError' || !err.message.includes('prod-123')) {
    throw new Error('ProductNotFoundError failed');
  }
  console.log('✓ ProductNotFoundError verified');

  console.log('ALL TYPE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
