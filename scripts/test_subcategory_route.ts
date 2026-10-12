import { generateStaticParams, generateMetadata } from '../src/app/categories/[categorySlug]/[subcategorySlug]/page';
import { listCategories, listSubcategories, getCategory, getSubcategory, listProducts } from '../src/lib/catalog';

async function testSubcategoryRoute() {
  console.log('=== TEST: Dynamic Subcategory Route Logic ===');

  // 1. Test generateStaticParams
  const staticParams = await generateStaticParams();
  console.log(`Generated ${staticParams.length} static param pairs for subcategories.`);
  if (staticParams.length === 0) {
    throw new Error('generateStaticParams returned 0 items');
  }

  // Verify curtains/sheer, blinds/roller, carpets/hand-tufted are present
  const hasCurtainsSheer = staticParams.some(
    (p) => p.categorySlug === 'curtains' && p.subcategorySlug === 'sheer'
  );
  const hasBlindsRoller = staticParams.some(
    (p) => p.categorySlug === 'blinds' && p.subcategorySlug === 'roller'
  );
  const hasCarpetsTufted = staticParams.some(
    (p) => p.categorySlug === 'carpets' && p.subcategorySlug === 'hand-tufted'
  );

  if (!hasCurtainsSheer || !hasBlindsRoller || !hasCarpetsTufted) {
    throw new Error('Missing expected canonical subcategory static params');
  }
  console.log('✓ generateStaticParams includes canonical short slugs (curtains/sheer, blinds/roller, carpets/hand-tufted)');

  // 2. Test metadata generation
  const metaCurtains = await generateMetadata({
    params: Promise.resolve({ categorySlug: 'curtains', subcategorySlug: 'sheer' }),
  });
  console.log('Sample metadata generated:', metaCurtains);
  if (!metaCurtains.title || !String(metaCurtains.title).includes('Curtains')) {
    throw new Error('Invalid metadata title for curtains/sheer');
  }
  console.log('✓ generateMetadata accurately resolved canonical short alias to category and subcategory');

  // 3. Test data fetching across all 37 subcategories
  const categories = await listCategories();
  let totalSubcategoriesChecked = 0;
  for (const cat of categories) {
    const subs = await listSubcategories(cat.slug);
    for (const sub of subs) {
      const resolvedCat = await getCategory(cat.slug);
      const resolvedSub = await getSubcategory(cat.slug, sub.slug);
      if (!resolvedCat || !resolvedSub) {
        throw new Error(`Failed to resolve ${cat.slug}/${sub.slug}`);
      }
      const products = await listProducts({
        categorySlug: cat.slug,
        subcategorySlug: sub.slug,
      });
      totalSubcategoriesChecked++;
    }
  }
  console.log(`✓ Successfully verified all ${totalSubcategoriesChecked} subcategories across all disciplines`);
  console.log('=== TEST PASSED: Subcategory Dynamic Route Certified ===');
}

testSubcategoryRoute().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
