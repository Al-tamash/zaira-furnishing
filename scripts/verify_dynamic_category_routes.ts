import { listCategories, listSubcategories, getCategory, getSubcategory, listProducts } from '../src/lib/catalog';
import { getCategoryHref, getSubcategoryHref, normalizeCategorySlug } from '../src/lib/data/categories';
import { generateStaticParams as generateCategoryStaticParams } from '../src/app/categories/[categorySlug]/page';
import { generateStaticParams as generateSubcategoryStaticParams } from '../src/app/categories/[categorySlug]/[subcategorySlug]/page';

async function verifyDynamicCategoryRoutes() {
  console.log('====================================================');
  console.log('  DYNAMIC CATEGORY ROUTES: FULL AUDIT SUITE         ');
  console.log('====================================================\n');

  // [AUDIT 1] Categories Coverage & Static Parameters
  console.log('[AUDIT 1] Auditing Category Landing Static Parameters...');
  const catStaticParams = await generateCategoryStaticParams();
  console.log(`  ✓ Generated ${catStaticParams.length} static category params.`);

  const categories = await listCategories();
  if (categories.length !== 9) {
    throw new Error(`Expected exactly 9 official categories, got ${categories.length}`);
  }

  for (const cat of categories) {
    const canonicalHref = getCategoryHref(cat.slug);
    const shortSlug = canonicalHref.replace('/categories/', '');
    const hasParam = catStaticParams.some((p) => p.categorySlug === shortSlug);
    if (!hasParam) {
      throw new Error(`Category static params missing: ${shortSlug}`);
    }
  }
  console.log('  ✓ All 9 disciplines accounted for with canonical short slugs.\n');

  // [AUDIT 2] Subcategory Coverage & Static Parameters
  console.log('[AUDIT 2] Auditing Subcategory Detail Static Parameters...');
  const subStaticParams = await generateSubcategoryStaticParams();
  console.log(`  ✓ Generated ${subStaticParams.length} static subcategory params.`);

  let totalExpectedSubcategories = 0;
  for (const cat of categories) {
    const subs = await listSubcategories(cat.slug);
    totalExpectedSubcategories += subs.length;
    const shortSlug = getCategoryHref(cat.slug).replace('/categories/', '');

    for (const sub of subs) {
      const hasParam = subStaticParams.some(
        (p) => p.categorySlug === shortSlug && p.subcategorySlug === sub.slug
      );
      if (!hasParam) {
        throw new Error(`Subcategory static params missing: ${shortSlug}/${sub.slug}`);
      }
    }
  }
  console.log(`  ✓ All ${totalExpectedSubcategories} subcategories mapped to static param routes.\n`);

  // [AUDIT 3] Slug Alias Resolution & Normalization
  console.log('[AUDIT 3] Auditing Slug Alias Normalization & Canonical Paths...');
  const aliasTests = [
    { input: 'curtains', expectedCanonical: '/categories/curtains', dbSlug: 'curtains-drapes' },
    { input: 'curtains-drapes', expectedCanonical: '/categories/curtains', dbSlug: 'curtains-drapes' },
    { input: 'blinds', expectedCanonical: '/categories/blinds', dbSlug: 'window-blinds-shades' },
    { input: 'window-blinds-shades', expectedCanonical: '/categories/blinds', dbSlug: 'window-blinds-shades' },
    { input: 'sofa-fabrics', expectedCanonical: '/categories/sofa-fabrics', dbSlug: 'sofa-fabrics-upholstery' },
    { input: 'sofa-fabrics-upholstery', expectedCanonical: '/categories/sofa-fabrics', dbSlug: 'sofa-fabrics-upholstery' },
    { input: 'wallpapers', expectedCanonical: '/categories/wallpapers', dbSlug: 'wallpapers-wall-coverings' },
    { input: 'wallpapers-wall-coverings', expectedCanonical: '/categories/wallpapers', dbSlug: 'wallpapers-wall-coverings' },
    { input: 'carpets', expectedCanonical: '/categories/carpets', dbSlug: 'carpets-rugs' },
    { input: 'carpets-rugs', expectedCanonical: '/categories/carpets', dbSlug: 'carpets-rugs' },
    { input: 'mattresses-sleep-systems', expectedCanonical: '/categories/mattresses-sleep-systems', dbSlug: 'mattresses-sleep-systems' },
    { input: 'wooden-flooring-sports-floor', expectedCanonical: '/categories/wooden-flooring-sports-floor', dbSlug: 'wooden-flooring-sports-floor' },
    { input: 'bed-linen-bath', expectedCanonical: '/categories/bed-linen-bath', dbSlug: 'bed-linen-bath' },
    { input: 'cushions-pillows', expectedCanonical: '/categories/cushions-pillows', dbSlug: 'cushions-pillows' },
  ];

  for (const test of aliasTests) {
    const resolvedCat = await getCategory(test.input);
    if (!resolvedCat) {
      throw new Error(`Failed to resolve alias: ${test.input}`);
    }
    if (resolvedCat.slug !== test.dbSlug) {
      throw new Error(`Alias ${test.input} resolved to wrong slug: ${resolvedCat.slug} !== ${test.dbSlug}`);
    }
    const canonical = getCategoryHref(resolvedCat.slug);
    if (canonical !== test.expectedCanonical) {
      throw new Error(`Wrong canonical href for ${test.input}: ${canonical} !== ${test.expectedCanonical}`);
    }
  }
  console.log(`  ✓ All ${aliasTests.length} alias and canonical slug mappings verified.\n`);

  // [AUDIT 4] Subcategory Product Resolution
  console.log('[AUDIT 4] Auditing Subcategory Product Filtering...');
  const keySubcategories = [
    { cat: 'curtains', sub: 'blackout', minCount: 1 },
    { cat: 'curtains', sub: 'sheer', minCount: 1 },
    { cat: 'curtains', sub: 'velvet', minCount: 1 },
    { cat: 'blinds', sub: 'roller', minCount: 1 },
    { cat: 'blinds', sub: 'motorized-smart', minCount: 1 },
    { cat: 'sofa-fabrics', sub: 'performance', minCount: 1 },
    { cat: 'wallpapers', sub: 'textured-grasscloth', minCount: 1 },
    { cat: 'carpets', sub: 'hand-tufted', minCount: 1 },
  ];

  for (const sample of keySubcategories) {
    const cat = await getCategory(sample.cat);
    if (!cat) throw new Error(`Category not found: ${sample.cat}`);
    const sub = await getSubcategory(cat.slug, sample.sub);
    if (!sub) throw new Error(`Subcategory not found: ${sample.cat}/${sample.sub}`);

    const products = await listProducts({
      categorySlug: cat.slug,
      subcategorySlug: sub.slug,
    });
    if (products.length < sample.minCount) {
      throw new Error(`Expected at least ${sample.minCount} products for ${sample.cat}/${sample.sub}, got ${products.length}`);
    }
    console.log(`  ✓ ${cat.name} -> ${sub.name}: ${products.length} products verified.`);
  }

  // Also verify empty subcategory resiliency (e.g. sofa-fabrics/boucle) returns clean array
  const emptySubProducts = await listProducts({
    categorySlug: 'sofa-fabrics-upholstery',
    subcategorySlug: 'boucle',
  });
  if (!Array.isArray(emptySubProducts) || emptySubProducts.length !== 0) {
    throw new Error('Expected unpopulated subcategory to safely return empty array');
  }
  console.log('  ✓ Unpopulated subcategory (sofa-fabrics/boucle) safely returns empty array.');
  console.log('');

  // [AUDIT 5] Edge Case & Non-Existent Slugs Handling
  console.log('[AUDIT 5] Auditing Edge Cases & 404 Resiliency...');
  const nonExistentCat = await getCategory('non-existent-category-xyz');
  if (nonExistentCat !== null) {
    throw new Error('Expected non-existent category to return null');
  }

  const nonExistentSub = await getSubcategory('curtains-drapes', 'non-existent-sub-xyz');
  if (nonExistentSub !== null) {
    throw new Error('Expected non-existent subcategory to return null');
  }
  console.log('  ✓ Non-existent category and subcategory safely return null.\n');

  console.log('====================================================');
  console.log('  ALL DYNAMIC ROUTE AUDITS PASSED SUCCESSFULLY!     ');
  console.log('====================================================\n');
}

verifyDynamicCategoryRoutes().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
