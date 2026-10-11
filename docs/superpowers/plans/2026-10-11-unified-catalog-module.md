# Unified Catalog Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify fragmented catalog data sources (`db/catalog.ts`, `db/queries/products.ts`, `db/queries/categories.ts`, static arrays) into a single deep Catalog module at `src/lib/catalog/` with an ergonomic 6-operation interface, encapsulated slug normalization, and automated database seed syncing.

**Architecture:** A deep `createCatalog(db: DatabaseClient)` engine that queries Cloudflare D1 / SQLite as the sole runtime source of truth, encapsulates table mapping and slug aliases, and memoizes reads via React `cache()`. Legacy query modules become thin forwarding adapters to ensure zero downtime and safe incremental migration.

**Tech Stack:** Next.js 16 (App Router), React 19 (`cache()`), Node.js `DatabaseSync` / Cloudflare D1, TypeScript 5, `tsx`.

**Spec:** Decisions settled in ADR [`docs/adr/0001-unified-catalog-source-of-truth.md`](file:///c:/Users/Mohd%20Azimullah/Downloads/zaira-furnishing%20%282%29/zaira-furnishing/docs/adr/0001-unified-catalog-source-of-truth.md) and domain vocabulary in [`GLOSSARY.md`](file:///c:/Users/Mohd%20Azimullah/Downloads/zaira-furnishing%20%282%29/zaira-furnishing/GLOSSARY.md).

## Global Constraints

- Database (D1 / SQLite) is the sole runtime source of truth; no silent in-memory fallback branching at runtime.
- Interface surface area is strictly limited to 6 core operations + `createCatalog` factory.
- All category/subcategory alias mappings (`curtains` <-> `curtains-drapes`, `cat-1`, etc.) stay internal to the module.
- Domain models crossing the seam must be clean, camelCase objects (`Product`, `Category`, `Subcategory`); never raw database rows.
- Existing routes must not break at any intermediate commit.

---

### Task 1: Catalog Domain Types & Contract

**Files:**
- Create: `src/lib/catalog/types.ts`
- Test: `scripts/test_catalog_types.ts`

**Interfaces:**
- Produces: `Product`, `Category`, `Subcategory`, `ProductFilter`, `CategoryFilter`, `CatalogService`

- [ ] **Step 1: Write type definitions**

Create `src/lib/catalog/types.ts` with strongly typed domain contracts:

```typescript
import {
  ProductType,
  ProductVariation,
  ProductSpecification,
  ProductImage,
} from '@/lib/data/types';

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featured: boolean;
  isCustomizable: boolean;
  itemCountText: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  shortDescription: string;
  description: string;
  productType: ProductType;
  price: number;
  startingPrice?: boolean;
  unit?: string;
  currency?: string;
  image: string;
  mainImage: string;
  galleryImages: string[];
  images: ProductImage[];
  variations: ProductVariation[];
  specifications: ProductSpecification[];
  spaceSlugs: string[];
  featured: boolean;
  customMeasurementAvailable: boolean;
  active: boolean;
  displayOrder: number;
  // Backward compatibility getters
  curtainType?: string;
  blindType?: string;
  sofaFabricType?: string;
  wallpaperType?: string;
  carpetType?: string;
}

export interface ProductFilter {
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  activeOnly?: boolean;
}

export interface CategoryFilter {
  featured?: boolean;
  activeOnly?: boolean;
}

export interface CatalogService {
  getProduct(slugOrId: string): Promise<Product | null>;
  listProducts(filter?: ProductFilter): Promise<Product[]>;
  getCategory(slugOrId: string): Promise<Category | null>;
  listCategories(filter?: CategoryFilter): Promise<Category[]>;
  getSubcategory(categorySlugOrId: string, subcategorySlug: string): Promise<Subcategory | null>;
  listSubcategories(categorySlugOrId?: string): Promise<Subcategory[]>;
}
```

- [ ] **Step 2: Create type validation test script**

Create `scripts/test_catalog_types.ts`:

```typescript
import { Product, Category, Subcategory, CatalogService } from '../src/lib/catalog/types';

// Static type check
const dummyService: Partial<CatalogService> = {};
console.log('Catalog types compile successfully.');
```

- [ ] **Step 3: Run type check**

Run: `npx tsx scripts/test_catalog_types.ts`
Expected: "Catalog types compile successfully."

- [ ] **Step 4: Commit**

```bash
git add src/lib/catalog/types.ts scripts/test_catalog_types.ts
git commit -m "feat(catalog): define canonical domain types and service contract"
```

---

### Task 2: Implement Core Catalog Engine (`createCatalog`)

**Files:**
- Create: `src/lib/catalog/engine.ts`
- Test: `scripts/test_catalog_engine.ts`

**Interfaces:**
- Consumes: `DatabaseClient` from `@/lib/db`, types from `./types`, master seed from `@/lib/data/officialCatalog` and `@/lib/data/categories`
- Produces: `createCatalog(db: DatabaseClient): CatalogService`

- [ ] **Step 1: Write test script for catalog engine**

Create `scripts/test_catalog_engine.ts` to test:
1. `listCategories()` returns all categories with normalized slugs.
2. `getCategory('curtains')` resolves via alias to `curtains-drapes`.
3. `listProducts({ categorySlug: 'curtains' })` filters by category.
4. `getProduct(slug)` fetches product with variations and gallery.
5. In-memory / test SQLite queries succeed without static array fallbacks.

- [ ] **Step 2: Run test to verify it fails initially**

Run: `npx tsx scripts/test_catalog_engine.ts`
Expected: FAIL (module `./src/lib/catalog/engine` not found).

- [ ] **Step 3: Implement `src/lib/catalog/engine.ts`**

Implement `createCatalog`:
- Slug normalization map (`curtains` <-> `curtains-drapes`, `blinds` <-> `window-blinds-shades`, `sofa` / `sofa-fabrics` <-> `sofa-fabrics-upholstery`, `wallpapers` <-> `wallpapers-wall-coverings`, `carpets` <-> `carpets-rugs`, `cat-1` <-> `curtains-drapes`, etc.).
- Ensure schema and verify tables exist; if `products` count is 0, auto-seed once using `CORE_SCHEMA_DDL` and official catalog data.
- Query methods with SQL parameter sanitization.
- Map database records into clean `Product`, `Category`, `Subcategory` instances.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx scripts/test_catalog_engine.ts`
Expected: PASS with 5/5 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog/engine.ts scripts/test_catalog_engine.ts
git commit -m "feat(catalog): implement deep catalog engine with slug normalization and DB persistence"
```

---

### Task 3: Public Catalog Seam & React Memoization

**Files:**
- Create: `src/lib/catalog/index.ts`
- Test: `scripts/test_catalog_public_seam.ts`

**Interfaces:**
- Produces:
  - `getProduct(slugOrId: string): Promise<Product | null>`
  - `listProducts(filter?: ProductFilter): Promise<Product[]>`
  - `getCategory(slugOrId: string): Promise<Category | null>`
  - `listCategories(filter?: CategoryFilter): Promise<Category[]>`
  - `getSubcategory(categorySlugOrId: string, subcategorySlug: string): Promise<Subcategory | null>`
  - `listSubcategories(categorySlugOrId?: string): Promise<Subcategory[]>`
  - `createCatalog(db?: DatabaseClient): CatalogService`
  - Re-exports all types from `./types`

- [ ] **Step 1: Write public seam test**

Create `scripts/test_catalog_public_seam.ts`:
- Import direct functions from `src/lib/catalog`.
- Fetch `listCategories()`, `getCategory('curtains')`, `listProducts()`, and `getProduct(...)`.
- Verify output validity and deduplication.

- [ ] **Step 2: Run test to verify failure**

Run: `npx tsx scripts/test_catalog_public_seam.ts`
Expected: FAIL (`src/lib/catalog/index.ts` not found).

- [ ] **Step 3: Implement `src/lib/catalog/index.ts`**

- Instantiate singleton `defaultCatalog = createCatalog(getDatabase())`.
- Wrap read methods with `React.cache()` for per-request deduplication:
  ```typescript
  import { cache } from 'react';
  import { getDatabase } from '@/lib/db';
  import { createCatalog } from './engine';
  import { CatalogService, ProductFilter, CategoryFilter } from './types';

  export * from './types';
  export { createCatalog } from './engine';

  const getDefaultCatalog = cache(() => createCatalog(getDatabase()));

  export const getProduct = cache((slugOrId: string) =>
    getDefaultCatalog().getProduct(slugOrId)
  );

  export const listProducts = (filter?: ProductFilter) =>
    getDefaultCatalog().listProducts(filter);

  export const getCategory = cache((slugOrId: string) =>
    getDefaultCatalog().getCategory(slugOrId)
  );

  export const listCategories = cache((filter?: CategoryFilter) =>
    getDefaultCatalog().listCategories(filter)
  );

  export const getSubcategory = cache((categorySlugOrId: string, subcategorySlug: string) =>
    getDefaultCatalog().getSubcategory(categorySlugOrId, subcategorySlug)
  );

  export const listSubcategories = (categorySlugOrId?: string) =>
    getDefaultCatalog().listSubcategories(categorySlugOrId);
  ```

- [ ] **Step 4: Run test to verify pass**

Run: `npx tsx scripts/test_catalog_public_seam.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog/index.ts scripts/test_catalog_public_seam.ts
git commit -m "feat(catalog): export public seam with React request memoization"
```

---

### Task 4: Backward-Compatible Forwarders in Legacy Modules

**Files:**
- Modify: `src/lib/db/catalog.ts`
- Modify: `src/lib/db/queries/products.ts`
- Test: `scripts/test_legacy_forwarders.ts`

**Interfaces:**
- Preserves existing function names (`getDynamicProducts`, `getDynamicProductBySlug`, `getDynamicCategories`, `getDynamicCategoryBySlug`, `getDynamicSubcategories`, `getDynamicSubcategoryBySlug`, `getDbProducts`, `getDbProductBySlug`) by redirecting them directly to `@/lib/catalog`.

- [ ] **Step 1: Write regression test for legacy imports**

Create `scripts/test_legacy_forwarders.ts`:
- Import `getDynamicProducts`, `getDynamicCategoryBySlug` from `src/lib/db/catalog`.
- Import `getDbProducts`, `getDbProductBySlug` from `src/lib/db/queries/products`.
- Verify they return consistent data matching the new catalog module.

- [ ] **Step 2: Update `src/lib/db/catalog.ts`**

Replace manual query boilerplate with delegates to `@/lib/catalog`:
- `getDynamicProducts(filter)` -> `listProducts(filter)`
- `getDynamicProductBySlug(slug)` -> `getProduct(slug)`
- `getDynamicCategories()` -> `listCategories()`
- `getDynamicCategoryBySlug(slug)` -> `getCategory(slug)`
- `getDynamicSubcategories(catId)` -> `listSubcategories(catId)`
- `getDynamicSubcategoryBySlug(catId, subSlug)` -> `getSubcategory(catId, subSlug)`

- [ ] **Step 3: Update `src/lib/db/queries/products.ts`**

Delegate `getDbProducts` and `getDbProductBySlug` to `@/lib/catalog` while preserving type compatibility.

- [ ] **Step 4: Run legacy test to verify compatibility**

Run: `npx tsx scripts/test_legacy_forwarders.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/catalog.ts src/lib/db/queries/products.ts scripts/test_legacy_forwarders.ts
git commit -m "refactor(catalog): convert legacy catalog and product query files to forwarders"
```

---

### Task 5: Migrate Route Callers to Direct `@/lib/catalog` Imports

**Files:**
- Modify: `src/app/products/[slug]/page.tsx`
- Modify: `src/app/categories/[categorySlug]/page.tsx`
- Modify: `src/app/categories/curtains/page.tsx` & `[type]/page.tsx`
- Modify: `src/app/categories/blinds/page.tsx` & `[type]/page.tsx`
- Modify: `src/app/categories/carpets/page.tsx` & `[type]/page.tsx`
- Modify: `src/app/categories/sofa-fabrics/page.tsx` & `[type]/page.tsx`
- Modify: `src/app/categories/wallpapers/page.tsx` & `[type]/page.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Update `src/app/products/[slug]/page.tsx`**

Replace:
```typescript
import { getDynamicProductBySlug, getDynamicProducts } from '@/lib/db/catalog';
```
With:
```typescript
import { getProduct, listProducts } from '@/lib/catalog';
```
And replace calls: `getDynamicProductBySlug` -> `getProduct`, `getDynamicProducts` -> `listProducts`.

- [ ] **Step 2: Update `src/app/categories/[categorySlug]/page.tsx`**

Replace `getDynamicCategories`, `getDynamicCategoryBySlug`, `getDynamicProducts` with `listCategories`, `getCategory`, `listProducts` from `@/lib/catalog`.

- [ ] **Step 3: Update dedicated category and type routes**

Update `curtains`, `blinds`, `carpets`, `sofa-fabrics`, and `wallpapers` pages to import from `@/lib/catalog`.

- [ ] **Step 4: Update `src/app/sitemap.ts`**

Replace imports with `@/lib/catalog`.

- [ ] **Step 5: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 type errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/
git commit -m "refactor(routes): migrate route callers to unified @/lib/catalog module"
```

---

### Task 6: Comprehensive Verification & Build Audit

**Files:**
- All touched files
- Verification script: `scripts/verify_catalog_unified.ts`

- [ ] **Step 1: Write end-to-end catalog verification script**

Create `scripts/verify_catalog_unified.ts` testing:
1. Product slug lookup across all categories.
2. Category and subcategory listing.
3. Search filtering and limit constraints.
4. Absence of runtime static fallback leakage.

- [ ] **Step 2: Run verification script**

Run: `npx tsx scripts/verify_catalog_unified.ts`
Expected: PASS.

- [ ] **Step 3: Run production Next.js build**

Run: `npm run build`
Expected: Build succeeds with all static and dynamic routes compiled without errors.

- [ ] **Step 4: Commit and finalize**

```bash
git add scripts/verify_catalog_unified.ts
git commit -m "test(catalog): add end-to-end verification suite for unified catalog module"
```
