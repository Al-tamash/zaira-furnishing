import { NextRequest } from 'next/server';
import { POST as createProductRoute } from '../src/app/api/admin/products/route';
import { PUT as updateProductRoute, DELETE as deleteProductRoute } from '../src/app/api/admin/products/[id]/route';

process.env.ADMIN_SECRET_KEY = 'Zaira@Admin2026';

async function run() {
  console.log('Testing Admin Product API Route Handlers...');

  // 1. Test POST /api/admin/products
  const createPayload = {
    name: 'API Route Test Fabric',
    category_id: 'sofa-fabrics-upholstery',
    base_price: 2400,
    main_image: '/images/test-fabric.jpg',
  };

  const postReq = new NextRequest('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'Zaira@Admin2026',
    },
    body: JSON.stringify(createPayload),
  });

  const postRes = await createProductRoute(postReq);
  const postData = await postRes.json();
  if (postRes.status !== 200 || !postData.success || !postData.id) {
    throw new Error('API POST product failed: ' + JSON.stringify(postData));
  }
  const createdId = postData.id;
  console.log(`✓ POST /api/admin/products returned 200 OK with ID: ${createdId}`);

  // 2. Test PUT /api/admin/products/[id]
  const putReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'Zaira@Admin2026',
    },
    body: JSON.stringify({ base_price: 2800 }),
  });

  const putRes = await updateProductRoute(putReq, { params: Promise.resolve({ id: createdId }) });
  const putData = await putRes.json();
  if (putRes.status !== 200 || !putData.success) {
    throw new Error('API PUT product failed: ' + JSON.stringify(putData));
  }
  console.log('✓ PUT /api/admin/products/[id] returned 200 OK');

  // 3. Test DELETE /api/admin/products/[id]
  const delReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdId}?permanent=true`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': 'Zaira@Admin2026',
    },
  });

  const delRes = await deleteProductRoute(delReq, { params: Promise.resolve({ id: createdId }) });
  const delData = await delRes.json();
  if (delRes.status !== 200 || !delData.success || !delData.deleted) {
    throw new Error('API DELETE product failed: ' + JSON.stringify(delData));
  }
  console.log('✓ DELETE /api/admin/products/[id] returned 200 OK');

  console.log('ALL API ROUTE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
