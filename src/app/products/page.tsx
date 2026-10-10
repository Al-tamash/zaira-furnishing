import { redirect } from 'next/navigation';

/**
 * The standalone "Shop All Furnishings" catalog page has been removed.
 * Users navigating to /products are seamlessly redirected to the category directory.
 * Direct product routes (/products/[slug]) remain active and unaffected.
 */
export default function ProductsPage() {
  redirect('/categories');
}
