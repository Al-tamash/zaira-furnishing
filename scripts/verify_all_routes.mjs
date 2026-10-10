const BASE_URL = 'http://localhost:3000';

async function testAllRoutes() {
  console.log('=== VERIFYING ALL 10 CURTAIN ROUTES & REPRESENTATIVE PRODUCTS ===\n');

  const curtainTypes = [
    'blackout',
    'sheer',
    'velvet',
    'satin',
    'jacquard',
    'linen',
    'printed',
    'embroidered',
    'kids',
    'custom'
  ];

  console.log('--- 1. Testing Curtain Type Routes (/categories/curtains/[type]) ---');
  for (const t of curtainTypes) {
    const res = await fetch(`${BASE_URL}/categories/curtains/${t}`);
    console.log(`/categories/curtains/${t} -> status: ${res.status}`);
    if (res.status !== 200) throw new Error(`Route failed: ${t}`);
  }

  const sampleProducts = [
    'blackout-curtains',
    'sand-beige-blackout-curtains',
    'sheer-day-curtains',
    'warm-champagne-luxe-voile-curtains',
    'velvet-curtains',
    'prussian-midnight-acoustic-velvet-curtains',
    'satin-plain-curtains',
    'champagne-heavy-sateen-curtains',
    'jacquard-curtains',
    'architectural-geometric-jacquard-drapes',
    'linen-textured-curtains',
    'olive-slub-relaxed-linen-drapes',
    'digitally-printed-curtains',
    'indigo-bloom-printed-curtains',
    'embroidered-curtains',
    'chantilly-lace-embroidered-drapes',
    'kids-room-curtains',
    'blush-starlight-nursery-curtains',
    'customized-made-to-measure-curtains',
    'architectural-ripplefold-motorized-drapes'
  ];

  console.log('\n--- 2. Testing Sample Product Detail Routes (/products/[slug]) ---');
  for (const slug of sampleProducts) {
    const res = await fetch(`${BASE_URL}/products/${slug}`);
    console.log(`/products/${slug} -> status: ${res.status}`);
    if (res.status !== 200) throw new Error(`Product route failed: ${slug}`);
  }

  console.log('\n✓ ALL ROUTES RETURNED 200 OK!');
}

testAllRoutes().catch(console.error);
