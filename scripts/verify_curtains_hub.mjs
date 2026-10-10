const BASE_URL = 'http://localhost:3000';

async function testCurtainsHub() {
  console.log('=== VERIFYING CURTAINS HUB (/categories/curtains) ===\n');

  const res = await fetch(`${BASE_URL}/categories/curtains`);
  const html = await res.text();
  console.log(`Hub page HTTP status: ${res.status}`);

  const types = [
    { slug: 'blackout', name: 'Blackout Curtains' },
    { slug: 'sheer', name: 'Sheer / Day Curtains' },
    { slug: 'velvet', name: 'Velvet Curtains' },
    { slug: 'satin', name: 'Satin Plain Curtains' },
    { slug: 'jacquard', name: 'Jacquard Curtains' },
    { slug: 'linen', name: 'Linen & Textured Curtains' },
    { slug: 'printed', name: 'Digitally Printed Curtains' },
    { slug: 'embroidered', name: 'Embroidered Curtains' },
    { slug: 'kids', name: 'Kids Room Curtains' },
    { slug: 'custom', name: 'Customized / Made-to-Measure' },
  ];

  let allPass = true;
  for (const t of types) {
    const hasLink = html.includes(`/categories/curtains/${t.slug}`);
    const hasName = html.includes(t.name);
    console.log(`Type "${t.name}" (/categories/curtains/${t.slug}): Link: ${hasLink ? 'OK' : 'MISSING'} | Name: ${hasName ? 'OK' : 'MISSING'}`);
    if (!hasLink || !hasName) allPass = false;
  }

  console.log(`\nOverall Curtains Hub Status: ${allPass ? 'ALL 10 TYPES PRESENT & LINKED' : 'FAIL'}`);
}

testCurtainsHub().catch(console.error);
