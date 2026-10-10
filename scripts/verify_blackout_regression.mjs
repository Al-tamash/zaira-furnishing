import { DatabaseSync } from 'node:sqlite';

const BASE_URL = 'http://localhost:3000';

async function testBlackoutRegression() {
  console.log('=== VERIFYING BLACKOUT CURTAINS REGRESSION ===\n');

  // 1. Blackout listing route
  const listingRes = await fetch(`${BASE_URL}/categories/curtains/blackout`);
  const listingHtml = await listingRes.text();
  console.log(`Blackout listing status: ${listingRes.status}`);
  console.log(`Contains Blackout Curtains: ${listingHtml.includes('Blackout Curtains') ? 'PASS' : 'FAIL'}`);
  console.log(`Contains Sand Beige: ${listingHtml.includes('Sand Beige') ? 'PASS' : 'FAIL'}`);
  console.log(`Contains Oatmeal: ${listingHtml.includes('Oatmeal') ? 'PASS' : 'FAIL'}`);
  console.log(`Contains Dove Grey: ${listingHtml.includes('Dove Grey') ? 'PASS' : 'FAIL'}`);

  // 2. Blackout product detail
  const detailRes = await fetch(`${BASE_URL}/products/blackout-curtains`);
  const detailHtml = await detailRes.text();
  console.log(`\nBlackout product detail status: ${detailRes.status}`);
  console.log(`Product Name: ${detailHtml.includes('Blackout Curtains') ? 'PASS' : 'FAIL'}`);
  console.log(`Price ₹3,850: ${detailHtml.includes('3,850') ? 'PASS' : 'FAIL'}`);
  console.log(`Gallery images: ${detailHtml.includes('warm-beige.jpg') || detailHtml.includes('dove-grey.jpg') ? 'PASS' : 'FAIL'}`);
  console.log(`Specifications (Light Control): ${detailHtml.includes('100% Total Blackout Solar Barrier') ? 'PASS' : 'FAIL'}`);
  console.log(`Request a Quote button: ${detailHtml.includes('Request a Quote') ? 'PASS' : 'FAIL'}`);
  console.log(`Book Free Measurement button: ${detailHtml.includes('Book Free Measurement') ? 'PASS' : 'FAIL'}`);

  // 3. Sand Beige product detail
  const beigeRes = await fetch(`${BASE_URL}/products/sand-beige-blackout-curtains`);
  const beigeHtml = await beigeRes.text();
  console.log(`\nSand Beige detail status: ${beigeRes.status}`);
  console.log(`Contains Sand Beige: ${beigeHtml.includes('Sand Beige') ? 'PASS' : 'FAIL'}`);

  console.log('\n=== BLACKOUT REGRESSION VERIFICATION COMPLETED ===');
}

testBlackoutRegression().catch(console.error);
