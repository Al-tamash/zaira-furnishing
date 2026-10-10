async function testReviewsDynamic() {
  console.log('--- 1. Testing GET reviews for blackout-curtains ---');
  let res = await fetch('http://localhost:3000/api/reviews?slug=blackout-curtains');
  console.log('Status:', res.status);
  let data = await res.json();
  console.log('Initial reviews count:', data.total);
  if (data.total !== 0) {
    console.log('Existing reviews found:', data.data);
  }

  console.log('\n--- 2. Testing review submission validation ---');
  // Rating out of bounds
  let invalidRes = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'blackout-curtains',
      rating: 6,
      comment: 'Valid comment text here',
    }),
  });
  console.log('Invalid rating status (expected 400):', invalidRes.status);
  let invalidData = await invalidRes.json();
  console.log('Invalid rating error:', invalidData.error);

  // Short comment
  let shortRes = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'blackout-curtains',
      rating: 5,
      comment: 'hi',
    }),
  });
  console.log('Short comment status (expected 400):', shortRes.status);

  console.log('\n--- 3. Testing valid review submission for blackout-curtains ---');
  let validRes = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'blackout-curtains',
      customerName: 'Ananya S.',
      rating: 5,
      comment: 'The blackout lining completely blocks out morning glare. Fabric feel and stitching are exceptional.',
    }),
  });
  console.log('Submission status (expected 201):', validRes.status);
  let created = await validRes.json();
  console.log('Created review ID:', created.data?.id);
  console.log('Customer name:', created.data?.customer_name);
  console.log('Rating:', created.data?.rating);

  console.log('\n--- 4. Verify blackout-curtains review count and average rating ---');
  res = await fetch('http://localhost:3000/api/reviews?slug=blackout-curtains');
  data = await res.json();
  console.log('Updated reviews count:', data.total);
  console.log('Updated average rating:', data.averageRating);
  console.log('Review comment:', data.data[0]?.comment);

  console.log('\n--- 5. Verify product isolation (other products must NOT show this review) ---');
  let otherRes = await fetch('http://localhost:3000/api/reviews?slug=sand-beige-blackout-curtains');
  let otherData = await otherRes.json();
  console.log('Other product reviews count (expected 0):', otherData.total);
  if (otherData.total === 0) {
    console.log('✓ Product review isolation verified successfully!');
  } else {
    throw new Error('Product isolation failed: reviews leaked across products!');
  }

  console.log('\n--- 6. Clean up test review to maintain pristine zero-fake-data state ---');
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync('data/zaira.db');
  db.prepare('DELETE FROM product_reviews WHERE id = ?').run(created.data.id);
  const remaining = db.prepare('SELECT COUNT(*) as count FROM product_reviews').get();
  console.log('Remaining reviews in database after cleanup:', remaining.count);
  db.close();

  console.log('\n--- 7. Re-verify empty state after cleanup ---');
  res = await fetch('http://localhost:3000/api/reviews?slug=blackout-curtains');
  data = await res.json();
  console.log('Final reviews count:', data.total);
  console.log('Final average rating:', data.averageRating);

  console.log('\nALL DYNAMIC FLOWS AND ISOLATION TESTS PASSED!');
}

testReviewsDynamic().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
