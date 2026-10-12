# Deep Product Administration Seam with Transaction Isolation Specification

> **Status:** Approved  
> **Date:** 2026-10-12  
> **Author:** Senior Principal Full-Stack Architect  
> **Topic:** Candidate 3 — Deep Product Administration Seam with Transaction Isolation  
> **Reference:** Extends ADR [`docs/adr/0001-unified-catalog-source-of-truth.md`](../../adr/0001-unified-catalog-source-of-truth.md) and [`GLOSSARY.md`](../../../GLOSSARY.md).

---

## 1. Executive Summary & Problem Statement

In the existing architecture, product administrative mutations (`POST`, `PUT`, `DELETE` at `/api/admin/products` and `/api/admin/products/[id]`) execute dozens of raw, unbatched `db.execute(...)` queries directly inside Next.js route handlers.
- **No Transaction Isolation:** If an insertion or update fails midway (e.g. at child variant 3 or specification 2), the core product row or partial child records remain in the database, causing orphaned records and data corruption.
- **Seam Bypassed:** Administrative mutations bypass the unified `@/lib/catalog` module entirely, duplicating category resolution, slug collision algorithms, and relation formatting across multiple endpoints.
- **Coupled Controllers:** Route handlers are weighed down by low-level SQL DDL/DML, child table ID formatting, and type coercions.

This specification deepens the [`@/lib/catalog`](../../../src/lib/catalog/index.ts) module by adding a dedicated, isolated administrative mutation seam (`CatalogAdminService`) backed by atomic transaction batches via `DatabaseClient.batch(...)`.

---

## 2. Architectural Boundaries & CQRS Structure

We follow the Command Query Responsibility Segregation (CQRS) pattern to maintain separation between read performance and administrative writes:

1. **Query Seam (`CatalogService`)**: Preserved in [`src/lib/catalog/types.ts`](../../../src/lib/catalog/types.ts). Provides fast, memoized queries (`getProduct`, `listProducts`, `getCategory`, etc.) for customer-facing storefront pages.
2. **Admin Mutation Seam (`CatalogAdminService`)**: Defined in `src/lib/catalog/admin-types.ts` and implemented in `src/lib/catalog/admin-engine.ts`. Provides atomic write operations (`createProduct`, `updateProduct`, `deleteProduct`).
3. **Public Seam Exporter**: Exported from [`src/lib/catalog/index.ts`](../../../src/lib/catalog/index.ts) with singleton instances and direct functional helpers.
4. **Pure & Decoupled Execution**: `CatalogAdminService` is runtime-agnostic. It does not import `next/headers` or `next/cache`. Instead, it returns an array of `affectedPaths: string[]`, which API controllers revalidate via `revalidatePath(...)`.

---

## 3. Data Contracts & Validation Schemas

### 3.1 Zod Schemas (`src/lib/catalog/admin-types.ts`)

```typescript
import { z } from 'zod';

export const ProductImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, 'Image URL is required'),
  altText: z.string().optional().nullable(),
  isMain: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const ProductVariantInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  variantType: z.enum([
    'color', 'pattern', 'material', 'finish',
    'thickness', 'opacity', 'firmness', 'design'
  ]).default('color'),
  sku: z.string().optional(),
  colorHex: z.string().optional().nullable(),
  thumbnailImage: z.string().optional().nullable(),
  previewImage: z.string().optional().nullable(),
  priceAdjustment: z.number().default(0),
  inStock: z.boolean().default(true),
  attributes: z.record(z.string()).default({}),
  active: z.boolean().default(true),
});

export const ProductSpecificationInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Specification label is required'),
  value: z.string().default(''),
});

export const CustomizationConfigInputSchema = z.object({
  id: z.string().optional(),
  fieldKey: z.string().min(1, 'Field key is required'),
  fieldLabel: z.string().optional(),
  fieldType: z.enum(['dimension_pair', 'select', 'number', 'text', 'boolean']).default('select'),
  options: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  defaultValue: z.string().optional().nullable(),
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  isRequired: z.boolean().default(false),
});

export const CreateProductInputSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  displayName: z.string().optional(),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID or slug is required'),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().default(''),
  shortDescription: z.string().default(''),
  productType: z.enum(['standard', 'custom_made']).default('standard'),
  pricingType: z.enum(['fixed', 'custom_estimate', 'tiered']).default('fixed'),
  price: z.number().min(0, 'Base price must be non-negative').default(0),
  startingPrice: z.boolean().default(false),
  unit: z.string().default('piece'),
  currency: z.string().default('₹'),
  customMade: z.boolean().default(false),
  featured: z.boolean().default(false),
  customMeasurementAvailable: z.boolean().default(false),
  active: z.boolean().default(true),
  displayOrder: z.number().default(0),
  spaceSlugs: z.array(z.string()).default([]),
  images: z.array(ProductImageInputSchema).default([]),
  variants: z.array(ProductVariantInputSchema).default([]),
  specifications: z.array(ProductSpecificationInputSchema).default([]),
  customizationConfigs: z.array(CustomizationConfigInputSchema).default([]),
});

export const UpdateProductInputSchema = CreateProductInputSchema.partial();

export const DeleteProductOptionsSchema = z.object({
  permanent: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductInputSchema>;
export type DeleteProductOptions = z.infer<typeof DeleteProductOptionsSchema>;

export interface ProductMutationResult {
  success: boolean;
  id: string;
  slug: string;
  action: 'created' | 'updated' | 'deactivated' | 'deleted';
  affectedPaths: string[];
}
```

### 3.2 Service Interface (`CatalogAdminService`)

```typescript
export interface CatalogAdminService {
  createProduct(input: CreateProductInput): Promise<ProductMutationResult>;
  updateProduct(id: string, input: UpdateProductInput): Promise<ProductMutationResult>;
  deleteProduct(id: string, options?: DeleteProductOptions): Promise<ProductMutationResult>;
}
```

---

## 4. Transaction Isolation & Batch Execution Engine

### 4.1 Batch Statement Construction

All database writes are staged into an in-memory `BatchStatement[]` list:

1. **Pre-flight Reads (Non-transactional, Idempotent)**:
   - Check category existence in `categories` table. If missing, prepare an `INSERT OR IGNORE INTO categories` statement as the head of the batch.
   - Resolve optional `subcategoryId` to a verified foreign key ID.
   - Derive clean slug and query `SELECT id FROM products WHERE slug = ?` to verify uniqueness, incrementing `-2`, `-3` if a conflict exists.
   - For updates: verify existing product via `SELECT * FROM products WHERE id = ?`.
2. **Batch Compilation**:
   - Primary `INSERT INTO products` or `UPDATE products`.
   - In update mode: child deletions (`DELETE FROM product_images WHERE product_id = ?`, etc.).
   - Relational inserts for `product_images`, `product_variants`, `product_specifications`, and `customization_configs`.
3. **Atomic Execution**:
   - Pass compiled statements to `await db.batch(statements)`.
   - **Local SQLite**: `BEGIN TRANSACTION` $\rightarrow$ execute all statements $\rightarrow$ `COMMIT`. If any statement throws, `ROLLBACK` triggers and resets database state.
   - **Cloudflare D1**: Dispatched as an atomic edge HTTP batch request in a single turn.

### 4.2 Error Handling & Custom Domain Errors

- `ProductNotFoundError`: Thrown when updating or deleting a non-existent product ID.
- `ZodError`: Thrown on schema invalidation before any database round-trip.
- Standard `Error`: Wrapped with context if the database batch fails.

---

## 5. Controller Refactoring

### 5.1 Backward Compatibility Mapper (`src/lib/catalog/admin-mapper.ts`)
Converts existing admin form inputs (`snake_case`, flat `main_image`/`gallery_images`, string numbers) into strongly typed `CreateProductInput` / `UpdateProductInput` structures without breaking the existing admin UI frontend.

### 5.2 Next.js API Routes
- [`src/app/api/admin/products/route.ts`](../../../src/app/api/admin/products/route.ts): Replaces 280 lines of procedural SQL with authorization check, payload normalization, `createProduct(...)`, and `revalidatePath(...)`.
- [`src/app/api/admin/products/[id]/route.ts`](../../../src/app/api/admin/products/[id]/route.ts): Replaces 300 lines of procedural SQL with `updateProduct(...)` and `deleteProduct(...)`.

---

## 6. Verification & Test Plan

1. **Type & Schema Test (`scripts/test_catalog_admin_types.ts`)**:
   - Verify that invalid payloads fail Zod validation with clear messages.
   - Verify that legacy `snake_case` payloads map accurately to domain models.
2. **Transaction Isolation & Rollback Test (`scripts/test_catalog_admin_transactions.ts`)**:
   - **Happy Path**: Create product with all 4 child types; assert all 11+ rows exist.
   - **Atomic Rollback**: Inject a failing SQL statement into the batch; assert that the product was completely rolled back and `SELECT * FROM products WHERE id = ?` is `null`.
   - **Atomic Update**: Update variants and images; assert previous child rows are cleanly replaced.
   - **Cascade Deletion**: Delete product permanently; assert zero orphaned child records.
3. **End-to-End Build & Compilation**:
   - `npx tsc --noEmit` verifies strict TypeScript across the entire project.
   - `npm run build` verifies full Next.js App Router production build.
