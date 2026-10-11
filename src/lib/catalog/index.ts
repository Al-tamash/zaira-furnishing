import { cache } from 'react';
import { getDatabase, DatabaseClient } from '@/lib/db';
import { createCatalog as createCatalogEngine } from './engine';
import { CatalogService, ProductFilter, CategoryFilter } from './types';

export * from './types';

let defaultCatalog: CatalogService | null = null;
function getCatalogInstance(): CatalogService {
  if (!defaultCatalog) {
    defaultCatalog = createCatalogEngine(getDatabase());
  }
  return defaultCatalog;
}

export function createCatalog(db?: DatabaseClient): CatalogService {
  return createCatalogEngine(db || getDatabase());
}

export const getProduct = cache((slugOrId: string) =>
  getCatalogInstance().getProduct(slugOrId)
);

export const listProducts = (filter?: ProductFilter) =>
  getCatalogInstance().listProducts(filter);

export const getCategory = cache((slugOrId: string) =>
  getCatalogInstance().getCategory(slugOrId)
);

export const listCategories = cache((filter?: CategoryFilter) =>
  getCatalogInstance().listCategories(filter)
);

export const getSubcategory = cache((categorySlugOrId: string, subcategorySlug: string) =>
  getCatalogInstance().getSubcategory(categorySlugOrId, subcategorySlug)
);

export const listSubcategories = (categorySlugOrId?: string) =>
  getCatalogInstance().listSubcategories(categorySlugOrId);
