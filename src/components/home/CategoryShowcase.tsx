'use client';

import React from 'react';
import { BrowseByCategories } from '@/components/home/BrowseByCategories';
import { DiscoveryCategory } from '@/lib/db/catalog';

interface CategoryShowcaseProps {
  categories?: DiscoveryCategory[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return <BrowseByCategories id="categories" categories={categories} />;
}

