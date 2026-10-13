import { redirect } from 'next/navigation';

/**
 * Direct e-commerce checkout has been streamlined into the WhatsApp Consultation & Shortlist Bag (/cart).
 * Users navigating to /checkout are seamlessly redirected to /cart.
 */
export default function CheckoutPage() {
  redirect('/cart');
}
