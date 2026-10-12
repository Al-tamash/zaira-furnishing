import { cache } from 'react';
import { getDatabase, DatabaseClient } from '@/lib/db';
import { createCatalog as createCatalogEngine } from './engine';
import { createCatalogAdmin as createCatalogAdminEngine } from './admin-engine';
import { CatalogService, ProductFilter, CategoryFilter } from './types';
import {
  CatalogAdminService,
  CreateProductInput,
  UpdateProductInput,
  DeleteProductOptions,
  ProductMutationResult,
} from './admin-types';

export * from './types';
export * from './admin-types';
export * from './admin-mapper';

let defaultCatalog: CatalogService | null = null;
function getCatalogInstance(): CatalogService {
  if (!defaultCatalog) {
    defaultCatalog = createCatalogEngine(getDatabase());
  }
  return defaultCatalog;
}

let defaultCatalogAdmin: CatalogAdminService | null = null;
function getCatalogAdminInstance(): CatalogAdminService {
  if (!defaultCatalogAdmin) {
    defaultCatalogAdmin = createCatalogAdminEngine(getDatabase());
  }
  return defaultCatalogAdmin;
}

export function createCatalog(db?: DatabaseClient): CatalogService {
  return createCatalogEngine(db || getDatabase());
}

export function createCatalogAdmin(db?: DatabaseClient): CatalogAdminService {
  return createCatalogAdminEngine(db || getDatabase());
}

// Storefront Queries (Memoized)
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

// Administrative Mutations (Atomic Transactions)
export const createProduct = (input: CreateProductInput): Promise<ProductMutationResult> =>
  getCatalogAdminInstance().createProduct(input);

export const updateProduct = (id: string, input: UpdateProductInput): Promise<ProductMutationResult> =>
  getCatalogAdminInstance().updateProduct(id, input);

export const deleteProduct = (id: string, options?: DeleteProductOptions): Promise<ProductMutationResult> =>
  getCatalogAdminInstance().deleteProduct(id, options);
