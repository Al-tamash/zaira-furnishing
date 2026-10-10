import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDynamicProductBySlug, getDynamicProducts } from '@/lib/db/catalog';
import {
  getDbProductReviews,
  getDbProductReviewSummary,
  formatReviewDate,
} from '@/lib/db/queries/reviews';
import { ProductDetailView } from '@/components/products/ProductDetailView';

// Ensure real-time runtime freshness for product detail pages
export const dynamicParams = true;
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getDynamicProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDynamicProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Zaira Furnishing',
    };
  }

  return {
    title: `${product.name} | Zaira Furnishing`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getDynamicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch reviews and review summary for this specific product
  const [reviewsData, reviewSummary] = await Promise.all([
    getDbProductReviews(product.id),
    getDbProductReviewSummary(product.id),
  ]);

  const initialReviews = reviewsData.map((r) => ({
    id: r.id,
    productId: r.product_id,
    rating: r.rating,
    authorName: r.customer_name || 'Verified Homeowner',
    isVerifiedPurchase: Boolean(r.is_verified_purchase === 1),
    date: formatReviewDate(r.created_at),
    comment: r.comment,
  }));

  // Only include products from the same category
  const allCategoryProducts = await getDynamicProducts({ categorySlug: product.categorySlug });
  const relatedProducts = allCategoryProducts.filter((p) => p.id !== product.id);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      initialReviews={initialReviews}
      initialReviewSummary={reviewSummary}
    />
  );
}
