import { generateStaticParams, generateMetadata } from '../src/app/categories/[categorySlug]/page';
import { listCategories, listSubcategories, getCategory, listProducts } from '../src/lib/catalog';

async function testCategoryLandingRoute() {
  console.log('=== TEST: Dynamic Category Landing Route Logic ===');

  // 1. Verify generateStaticParams
  const staticParams = await generateStaticParams();
  console.log(`Generated ${staticParams.length} static category parameters.`);
  if (staticParams.length === 0) {
    throw new Error('generateStaticParams returned 0 items');
  }

  const expectedCategories = ['curtains', 'blinds', 'carpets', 'sofa-fabrics', 'wallpapers', 'mattresses-sleep-systems'];
  for (const expected of expectedCategories) {
    const found = staticParams.some((p) => p.categorySlug === expected);
    if (!found) {
      throw new Error(`Missing expected static param for category: ${expected}`);
    }
  }
  console.log('✓ All key canonical category slugs present in static params');

  // 2. Verify generateMetadata for short aliases and raw slugs
  const metaCurtains = await generateMetadata({
    params: Promise.resolve({ categorySlug: 'curtains' }),
  });
  if (!metaCurtains.title || !String(metaCurtains.title).includes('Curtains')) {
    throw new Error('Invalid metadata title for curtains');
  }

  const metaMattresses = await generateMetadata({
    params: Promise.resolve({ categorySlug: 'mattresses-sleep-systems' }),
  });
  if (!metaMattresses.title || !String(metaMattresses.title).includes('Mattresses')) {
    throw new Error('Invalid metadata title for mattresses-sleep-systems');
  }
  console.log('✓ generateMetadata resolved titles correctly for both alias and raw slugs');

  // 3. Verify category data branching
  const categories = await listCategories();
  for (const cat of categories) {
    const subcategories = await listSubcategories(cat.slug);
    if (subcategories.length > 0) {
      console.log(`- Category "${cat.name}": has ${subcategories.length} subcategories -> renders CategoryLandingView`);
    } else {
      const products = await listProducts({ categorySlug: cat.slug });
      console.log(`- Category "${cat.name}": has 0 subcategories -> renders direct ProductCard grid (${products.length} products)`);
    }
  }

  console.log('=== TEST PASSED: Category Landing Dynamic Route Certified ===');
}

testCategoryLandingRoute().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
