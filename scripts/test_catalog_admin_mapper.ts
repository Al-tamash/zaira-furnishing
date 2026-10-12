import {
  normalizeCreateProductPayload,
  normalizeUpdateProductPayload,
} from '../src/lib/catalog/admin-mapper';

async function run() {
  console.log('Testing Admin Mapper Normalization...');

  // Test 1: Full snake_case payload mapping
  const legacyPayload = {
    name: 'Royale Velvet Cushion',
    category_id: 'cat-10',
    subcategory_id: 'sub-cushion-velvet',
    base_price: '1299',
    main_image: '/images/cushion-main.jpg',
    gallery_images: ['/images/cushion-1.jpg', '/images/cushion-2.jpg'],
    custom_made: 1,
    custom_measurement_available: 0,
    active: 1,
    variants: [
      {
        name: 'Emerald Green',
        variant_type: 'color',
        color_hex: '#005522',
        price_adjustment: '200',
        in_stock: 1,
      },
    ],
    specifications: [
      { label: 'Material', value: '100% Cotton Velvet' },
    ],
  };

  const normalized = normalizeCreateProductPayload(legacyPayload);

  if (normalized.categoryId !== 'cat-10') throw new Error('Failed category_id mapping');
  if (normalized.subcategoryId !== 'sub-cushion-velvet') throw new Error('Failed subcategory_id mapping');
  if (normalized.price !== 1299) throw new Error('Failed base_price conversion');
  if (normalized.customMade !== true) throw new Error('Failed custom_made conversion');
  if (normalized.images.length !== 3) throw new Error('Failed main + gallery image merging');
  if (normalized.images[0].url !== '/images/cushion-main.jpg' || !normalized.images[0].isMain) {
    throw new Error('Main image not marked correctly');
  }
  if (normalized.variants[0].priceAdjustment !== 200) throw new Error('Variant priceAdjustment failed');
  console.log('✓ Legacy snake_case payload normalized to domain model');

  // Test 2: Update payload normalization
  const updatePayload = {
    base_price: 1599,
    featured: 1,
  };
  const updateNormalized = normalizeUpdateProductPayload(updatePayload);
  if (updateNormalized.price !== 1599) throw new Error('Update price failed');
  if (updateNormalized.featured !== true) throw new Error('Update featured failed');
  if (updateNormalized.name !== undefined) throw new Error('Unmodified name should be undefined');
  console.log('✓ Partial update payload normalized correctly');

  console.log('ALL MAPPER TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
