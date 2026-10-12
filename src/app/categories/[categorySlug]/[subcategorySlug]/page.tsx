import React from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { listCategories, listSubcategories, getCategory, getSubcategory, listProducts } from '@/lib/catalog';
import { getCategoryHref } from '@/lib/data/categories';
import { SubcategoryDetailView } from '@/components/category/SubcategoryDetailView';

interface SubcategoryPageProps {
  params: Promise<{
    categorySlug: string;
    subcategorySlug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await listCategories();
  const params: { categorySlug: string; subcategorySlug: string }[] = [];

  for (const cat of categories) {
    const subcategories = await listSubcategories(cat.slug);
    const href = getCategoryHref(cat.slug);
    const shortSlug = href.replace('/categories/', '');

    for (const sub of subcategories) {
      params.push({ categorySlug: shortSlug, subcategorySlug: sub.slug });
      if (shortSlug !== cat.slug) {
        params.push({ categorySlug: cat.slug, subcategorySlug: sub.slug });
      }
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) {
    return { title: 'Category Not Found | Zaira Furnishing' };
  }

  const subcategory = await getSubcategory(category.slug, subcategorySlug);
  if (!subcategory) {
    return { title: `${category.name} | Zaira Furnishing` };
  }

  return {
    title: `${subcategory.name} | ${category.name} | Zaira Furnishing`,
    description: subcategory.description || category.description,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;

  const category = await getCategory(categorySlug);
  if (!category) {
    notFound();
  }

  // Canonicalize category slug URL (e.g., /categories/curtains-drapes/sheer -> /categories/curtains/sheer)
  const canonicalHref = getCategoryHref(category.slug);
  const canonicalShortSlug = canonicalHref.replace('/categories/', '');

  if (categorySlug !== canonicalShortSlug) {
    redirect(`/categories/${canonicalShortSlug}/${subcategorySlug}`);
  }

  const subcategory = await getSubcategory(category.slug, subcategorySlug);
  if (!subcategory) {
    notFound();
  }

  // Fetch products matching category and subcategory from SQLite / Cloudflare D1
  const products = await listProducts({
    categorySlug: category.slug,
    subcategorySlug: subcategory.slug,
  });

  return (
    <SubcategoryDetailView
      category={category}
      subcategory={subcategory}
      products={products}
      canonicalSlug={canonicalShortSlug}
    />
  );
}
