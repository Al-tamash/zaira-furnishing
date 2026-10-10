import { getDatabase } from '../src/lib/db/index.ts';
import { createDbProductReview } from '../src/lib/db/queries/reviews.ts';

async function main() {
  try {
    const db = getDatabase();
    const res = await createDbProductReview({
      productId: 'new-product-slug-test',
      customerName: 'chinni',
      rating: 5,
      comment: 'Great quality fabrics and fast delivery',
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('EXACT DB ERROR:', err);
  }
}

main();
