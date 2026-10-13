// scripts/verify_products_v2.mjs
// Verification of the 13 Representative Products across all categories
import { DatabaseSync } from 'node:sqlite';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const db = new DatabaseSync('data/zaira.db');

const targetProducts = [
  { slug: 'blackout-curtains', name: 'Blackout Curtains', expectMultiVariants: false, type: 'custom_made' },
  { slug: 'sheer-day-curtains', name: 'Sheer / Day Curtains', expectMultiVariants: true, type: 'custom_made' },
  { slug: 'velvet-curtains', name: 'Velvet Curtains', expectMultiVariants: true, type: 'custom_made' },
  { slug: 'satin-plain-curtains', name: 'Satin Plain Curtains', expectMultiVariants: true, type: 'custom_made' },
  { slug: 'linen-textured-curtains', name: 'Linen & Textured Curtains', expectMultiVariants: true, type: 'custom_made' },
  { slug: 'roller-blinds', name: 'Roller Blinds', expectMultiVariants: false, type: 'custom_made' },
  { slug: 'monaco-crush-resistant-matte-velvet', name: 'Monaco Crush-Resistant Matte Velvet', expectMultiVariants: true, type: 'custom_made' },
  { slug: 'botanical-textured-wallcovering', name: 'Botanical Textured Wallcovering', expectMultiVariants: false, type: 'custom_made' },
  { slug: 'ortho-contour-hybrid-pocket-spring-mattress', name: 'OrthoContour Hybrid Pocket Spring & Latex Mattress', expectMultiVariants: true, expectSizeLabel: true, type: 'standard' },
  { slug: 'solis-hand-tufted-wool-silk-rug', name: 'Solis Hand-Tufted Botanical Wool Rug', expectMultiVariants: false, type: 'custom_made' },
  { slug: 'european-prime-natural-oak-flooring', name: 'European Prime Engineered Oak Flooring', expectMultiVariants: false, type: 'custom_made' },
  { slug: 'egyptian-sateen-luxury-bed-linen-set', name: '800TC Egyptian Cotton Sateen Bed Set', expectMultiVariants: false, type: 'standard' },
  { slug: 'atelia-embroidered-linen-cushion', name: 'Atelia Geometric Embroidered Cushion Cover', expectMultiVariants: false, type: 'standard' },
];

let passed = 0;
let failed = 0;

async function run() {
  console.log('====================================================');
  console.log('PRODUCT DETAIL V2: 13 REPRESENTATIVE PRODUCTS AUDIT');
  console.log('====================================================\n');

  for (const item of targetProducts) {
    try {
      const res = await fetch(`${BASE_URL}/products/${item.slug}`);
      if (res.status !== 200) {
        console.error(`❌ FAIL: /products/${item.slug} returned status ${res.status}`);
        failed++;
        continue;
      }
      const html = await res.text();

      // 1. Verify Name
      const hasName = html.includes(item.name) || html.includes(item.name.replace('&', '&amp;'));
      if (!hasName) {
        console.error(`❌ FAIL: ${item.slug} missing product name in HTML`);
        failed++;
        continue;
      }

      // 2. Verify Price Currency Symbol ₹
      if (!html.includes('₹')) {
        console.error(`❌ FAIL: ${item.slug} missing currency symbol ₹`);
        failed++;
        continue;
      }

      // 3. Verify Variant Selector Rules
      const hasSelector = html.includes('Select Colour:') || html.includes('Select Option:') || html.includes('Select Size:');
      if (item.expectMultiVariants && !hasSelector) {
        console.error(`❌ FAIL: ${item.slug} expected variant selector but none found`);
        failed++;
        continue;
      }
      if (!item.expectMultiVariants && hasSelector) {
        console.error(`❌ FAIL: ${item.slug} has unexpected variant selector`);
        failed++;
        continue;
      }
      if (item.expectSizeLabel && !html.includes('Select Size:')) {
        console.error(`❌ FAIL: ${item.slug} expected "Select Size:" label`);
        failed++;
        continue;
      }

      // 4. Verify CTAs by Product Type
      if (item.type === 'standard') {
        if (!html.includes('Add to Cart') || !html.includes('Buy Now')) {
          console.error(`❌ FAIL: Standard product ${item.slug} missing Add to Cart / Buy Now`);
          failed++;
          continue;
        }
      } else {
        if (!html.includes('Request a Quote')) {
          console.error(`❌ FAIL: Custom product ${item.slug} missing Request a Quote`);
          failed++;
          continue;
        }
      }

      // 5. Verify WhatsApp button
      if (!html.includes('Order on WhatsApp') && !html.includes('wa.me/916300145763')) {
        console.error(`❌ FAIL: ${item.slug} missing WhatsApp action`);
        failed++;
        continue;
      }

      console.log(`  ✅ PASS: ${item.name} (${item.slug}) [${item.type}]`);
      passed++;
    } catch (e) {
      console.error(`❌ FAIL: ${item.slug} threw exception: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nAUDIT SUMMARY: ${passed} / ${targetProducts.length} PASSED, ${failed} FAILED\n`);
  db.close();

  if (failed > 0) process.exit(1);
}

run();
