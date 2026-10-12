# Deep Product Administration Seam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the `@/lib/catalog` module with an isolated, strongly-typed administrative mutation seam (`CatalogAdminService`) backed by atomic transaction batches (`DatabaseClient.batch(...)`), replacing 580+ lines of raw procedural SQL in admin API route handlers with true ACID transaction isolation.

**Architecture:** A CQRS-style architecture where query responsibilities stay with `CatalogService` for storefront caching, and administrative write operations are handled by `CatalogAdminService`. All mutations (`createProduct`, `updateProduct`, `deleteProduct`) compile in-memory `BatchStatement[]` lists and commit atomically via `db.batch(statements)`. If any statement fails, the database automatically rolls back. Controllers normalize incoming forms, delegate to the seam, and revalidate affected paths returned by the service.

**Tech Stack:** Next.js 16 (App Router), Node.js `DatabaseSync` / SQLite, Cloudflare D1, Zod 3, TypeScript 5, `tsx`.

**Spec:** [`docs/superpowers/specs/2026-10-12-deep-product-admin-seam-design.md`](file:///c:/Users/Mohd%20Azimullah/Downloads/zaira-furnishing%20%282%29/zaira-furnishing/docs/superpowers/specs/2026-10-12-deep-product-admin-seam-design.md).

---

## Global Constraints

- **Atomicity:** All product mutations touching multiple tables (`products`, `product_images`, `product_variants`, `product_specifications`, `customization_configs`) MUST be executed via `db.batch(...)`. No dangling rows on error.
- **Pure Seam:** `CatalogAdminService` MUST remain environment-agnostic (no imports from `next/cache` or `next/headers`). It returns `affectedPaths: string[]` for callers to revalidate.
- **Backward Compatibility:** Must support all existing admin UI form inputs (`snake_case`, flat `main_image`/`gallery_images`, numbers sent as strings).
- **Strict TypeScript:** No `any` types. Strict Zod parsing and validation.

---

### Task 1: Admin Types, Zod Schemas & Domain Errors

**Files:**
- Create: `src/lib/catalog/admin-types.ts`
- Test: `scripts/test_catalog_admin_types.ts`

**Interfaces:**
- Produces: `CreateProductInputSchema`, `UpdateProductInputSchema`, `DeleteProductOptionsSchema`, `ProductMutationResult`, `CatalogAdminService`, `ProductNotFoundError`

- [ ] **Step 1: Create `src/lib/catalog/admin-types.ts`**

Define domain error classes, Zod validation schemas, and service contracts:

```typescript
import { z } from 'zod';

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product with ID or slug "${productId}" was not found.`);
    this.name = 'ProductNotFoundError';
  }
}

export const ProductImageInputSchema = z.object({
  id: z.string().optional(),
  url: z.string().min(1, 'Image URL is required'),
  altText: z.string().optional().nullable(),
  displayOrder: z.number().default(0),
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
  attributes: z.record(z.unknown()).default({}),
  displayOrder: z.number().default(0),
  active: z.boolean().default(true),
});

export const ProductSpecificationInputSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Specification label is required'),
  value: z.string().default(''),
  displayOrder: z.number().default(0),
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
  displayOrder: z.number().default(0),
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

export type ProductImageInput = z.infer<typeof ProductImageInputSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantInputSchema>;
export type ProductSpecificationInput = z.infer<typeof ProductSpecificationInputSchema>;
export type CustomizationConfigInput = z.infer<typeof CustomizationConfigInputSchema>;
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

export interface CatalogAdminService {
  createProduct(input: CreateProductInput): Promise<ProductMutationResult>;
  updateProduct(id: string, input: UpdateProductInput): Promise<ProductMutationResult>;
  deleteProduct(id: string, options?: DeleteProductOptions): Promise<ProductMutationResult>;
}
```

- [ ] **Step 2: Create unit test `scripts/test_catalog_admin_types.ts`**

```typescript
import {
  CreateProductInputSchema,
  UpdateProductInputSchema,
  DeleteProductOptionsSchema,
  ProductNotFoundError,
} from '../src/lib/catalog/admin-types';

async function run() {
  console.log('Testing Admin Zod Schemas...');

  // Test 1: Valid product creation schema
  const valid = CreateProductInputSchema.safeParse({
    name: 'Bespoke Velvet Drape',
    categoryId: 'curtains-drapes',
    price: 4500,
    images: [{ url: '/img/curtain.jpg', isMain: true }],
    variants: [{ name: 'Gold Sheen', variantType: 'color', priceAdjustment: 500 }],
  });
  if (!valid.success) {
    throw new Error('Valid payload failed to parse: ' + JSON.stringify(valid.error.errors));
  }
  console.log('✓ Valid create schema parsed successfully');

  // Test 2: Reject empty product name
  const emptyName = CreateProductInputSchema.safeParse({
    name: '',
    categoryId: 'curtains-drapes',
  });
  if (emptyName.success) {
    throw new Error('Should have rejected empty name');
  }
  console.log('✓ Correctly rejected empty name');

  // Test 3: Reject negative price
  const negativePrice = CreateProductInputSchema.safeParse({
    name: 'Curtain',
    categoryId: 'curtains-drapes',
    price: -100,
  });
  if (negativePrice.success) {
    throw new Error('Should have rejected negative price');
  }
  console.log('✓ Correctly rejected negative price');

  // Test 4: Error instantiation
  const err = new ProductNotFoundError('prod-123');
  if (err.name !== 'ProductNotFoundError' || !err.message.includes('prod-123')) {
    throw new Error('ProductNotFoundError failed');
  }
  console.log('✓ ProductNotFoundError verified');

  console.log('ALL TYPE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run schema test**

Run:
```bash
npx tsx scripts/test_catalog_admin_types.ts
```

- [ ] **Step 4: Commit Task 1**

```bash
git add src/lib/catalog/admin-types.ts scripts/test_catalog_admin_types.ts
git commit -m "feat(catalog): add admin mutation types, Zod validation schemas, and domain errors"
```

---

### Task 2: Input Normalization Adapter

**Files:**
- Create: `src/lib/catalog/admin-mapper.ts`
- Test: `scripts/test_catalog_admin_mapper.ts`

**Interfaces:**
- Consumes: Raw HTTP JSON payloads (including legacy `snake_case` from admin UI)
- Produces: `normalizeCreateProductPayload(raw: unknown): CreateProductInput`, `normalizeUpdateProductPayload(raw: unknown): UpdateProductInput`

- [ ] **Step 1: Create `src/lib/catalog/admin-mapper.ts`**

Map legacy fields (`category_id`, `subcategory_id`, `custom_made`, `main_image`, `gallery_images`, etc.) to strongly typed inputs:

```typescript
import {
  CreateProductInput,
  CreateProductInputSchema,
  UpdateProductInput,
  UpdateProductInputSchema,
  ProductImageInput,
  ProductVariantInput,
  ProductSpecificationInput,
  CustomizationConfigInput,
} from './admin-types';

export function normalizeCreateProductPayload(raw: any): CreateProductInput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid request payload: must be a JSON object');
  }

  // 1. Resolve images: prioritize raw.images array, fallback to main_image & gallery_images
  let images: ProductImageInput[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0) {
    images = raw.images.map((img: any, idx: number) => ({
      id: img.id,
      url: img.url || img.image_url || '',
      altText: img.altText || img.alt_text || raw.name || '',
      displayOrder: typeof img.displayOrder === 'number' ? img.displayOrder : typeof img.display_order === 'number' ? img.display_order : idx,
      isMain: Boolean(img.isMain || img.is_main || idx === 0),
      active: img.active !== undefined ? Boolean(img.active) : true,
    }));
  } else {
    const mainImg = raw.main_image || raw.mainImage;
    if (mainImg) {
      images.push({
        url: mainImg,
        altText: raw.name || '',
        displayOrder: 0,
        isMain: true,
        active: true,
      });
    }
    const gallery = Array.isArray(raw.gallery_images) ? raw.gallery_images : Array.isArray(raw.galleryImages) ? raw.galleryImages : [];
    gallery.forEach((url: string, idx: number) => {
      if (url && url !== mainImg) {
        images.push({
          url,
          altText: raw.name || '',
          displayOrder: idx + 1,
          isMain: false,
          active: true,
        });
      }
    });
  }

  // 2. Resolve variants
  const variants: ProductVariantInput[] = Array.isArray(raw.variants)
    ? raw.variants.map((v: any, idx: number) => {
        let attrs: Record<string, unknown> = {};
        if (v.attributes) {
          if (typeof v.attributes === 'object') {
            attrs = v.attributes;
          } else if (typeof v.attributes === 'string') {
            try {
              attrs = JSON.parse(v.attributes);
            } catch {
              attrs = {};
            }
          }
        }
        return {
          id: v.id,
          name: v.name || `Variant ${idx + 1}`,
          variantType: v.variantType || v.variant_type || 'color',
          sku: v.sku,
          colorHex: v.colorHex || v.color_hex || null,
          thumbnailImage: v.thumbnailImage || v.thumbnail_image || null,
          previewImage: v.previewImage || v.preview_image || null,
          priceAdjustment: Number(v.priceAdjustment ?? v.price_adjustment ?? 0) || 0,
          inStock: v.inStock !== undefined ? Boolean(v.inStock) : v.in_stock !== undefined ? Boolean(v.in_stock) : true,
          attributes: attrs,
          displayOrder: typeof v.displayOrder === 'number' ? v.displayOrder : typeof v.display_order === 'number' ? v.display_order : idx,
          active: v.active !== undefined ? Boolean(v.active) : true,
        };
      })
    : [];

  // 3. Resolve specifications
  const specifications: ProductSpecificationInput[] = Array.isArray(raw.specifications)
    ? raw.specifications
        .filter((s: any) => s && (s.label || s.value))
        .map((s: any, idx: number) => ({
          id: s.id,
          label: (s.label || '').trim(),
          value: (s.value || '').trim(),
          displayOrder: typeof s.displayOrder === 'number' ? s.displayOrder : typeof s.display_order === 'number' ? s.display_order : idx,
        }))
    : [];

  // 4. Resolve customization configs
  const customizationConfigs: CustomizationConfigInput[] = Array.isArray(raw.customization_configs || raw.customizationConfigs)
    ? (raw.customization_configs || raw.customizationConfigs)
        .filter((c: any) => c && (c.field_key || c.fieldKey))
        .map((c: any, idx: number) => {
          let opts: any = c.options;
          if (opts && typeof opts === 'string') {
            const trimmed = opts.trim();
            if (trimmed.startsWith('[')) {
              try {
                opts = JSON.parse(trimmed);
              } catch {
                opts = trimmed;
              }
            } else {
              opts = trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
          }
          return {
            id: c.id,
            fieldKey: (c.fieldKey || c.field_key).trim(),
            fieldLabel: (c.fieldLabel || c.field_label || c.fieldKey || c.field_key).trim(),
            fieldType: c.fieldType || c.field_type || 'select',
            options: opts,
            defaultValue: c.defaultValue || c.default_value || null,
            minValue: c.minValue !== undefined ? Number(c.minValue) : c.min_value !== undefined ? Number(c.min_value) : null,
            maxValue: c.maxValue !== undefined ? Number(c.maxValue) : c.max_value !== undefined ? Number(c.max_value) : null,
            unit: c.unit || null,
            isRequired: Boolean(c.isRequired || c.is_required),
            displayOrder: typeof c.displayOrder === 'number' ? c.displayOrder : typeof c.display_order === 'number' ? c.display_order : idx,
          };
        })
    : [];

  const candidate = {
    name: String(raw.name || '').trim(),
    displayName: raw.displayName || raw.display_name ? String(raw.displayName || raw.display_name).trim() : undefined,
    slug: raw.slug ? String(raw.slug).trim() : undefined,
    categoryId: String(raw.categoryId || raw.category_id || '').trim(),
    subcategoryId: raw.subcategoryId || raw.subcategory_id ? String(raw.subcategoryId || raw.subcategory_id).trim() : null,
    description: String(raw.description || '').trim(),
    shortDescription: String(raw.shortDescription || raw.short_description || raw.description || '').trim(),
    productType: raw.productType || raw.product_type || 'standard',
    pricingType: raw.pricingType || raw.pricing_type || 'fixed',
    price: Number(raw.price ?? raw.base_price ?? 0) || 0,
    startingPrice: Boolean(raw.startingPrice || raw.starting_price),
    unit: raw.unit ? String(raw.unit).trim() : 'piece',
    currency: raw.currency ? String(raw.currency).trim() : '₹',
    customMade: Boolean(raw.customMade || raw.custom_made),
    featured: Boolean(raw.featured),
    customMeasurementAvailable: Boolean(raw.customMeasurementAvailable || raw.custom_measurement_available),
    active: raw.active !== undefined ? Boolean(raw.active === 1 || raw.active === true || raw.active === '1') : true,
    displayOrder: Number(raw.displayOrder ?? raw.display_order ?? 0) || 0,
    spaceSlugs: Array.isArray(raw.spaceSlugs || raw.space_slugs) ? (raw.spaceSlugs || raw.space_slugs) : [],
    images,
    variants,
    specifications,
    customizationConfigs,
  };

  return CreateProductInputSchema.parse(candidate);
}

export function normalizeUpdateProductPayload(raw: any): UpdateProductInput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid request payload: must be a JSON object');
  }

  const normalized = normalizeCreateProductPayload({
    name: raw.name || 'temporary-placeholder',
    categoryId: raw.categoryId || raw.category_id || 'temporary-cat',
    ...raw,
  });

  const updateCandidate: Record<string, unknown> = {};

  if (raw.name !== undefined) updateCandidate.name = normalized.name;
  if (raw.displayName !== undefined || raw.display_name !== undefined) updateCandidate.displayName = normalized.displayName;
  if (raw.slug !== undefined) updateCandidate.slug = normalized.slug;
  if (raw.categoryId !== undefined || raw.category_id !== undefined) updateCandidate.categoryId = normalized.categoryId;
  if (raw.subcategoryId !== undefined || raw.subcategory_id !== undefined) updateCandidate.subcategoryId = normalized.subcategoryId;
  if (raw.description !== undefined) updateCandidate.description = normalized.description;
  if (raw.shortDescription !== undefined || raw.short_description !== undefined) updateCandidate.shortDescription = normalized.shortDescription;
  if (raw.productType !== undefined || raw.product_type !== undefined) updateCandidate.productType = normalized.productType;
  if (raw.pricingType !== undefined || raw.pricing_type !== undefined) updateCandidate.pricingType = normalized.pricingType;
  if (raw.price !== undefined || raw.base_price !== undefined) updateCandidate.price = normalized.price;
  if (raw.startingPrice !== undefined || raw.starting_price !== undefined) updateCandidate.startingPrice = normalized.startingPrice;
  if (raw.unit !== undefined) updateCandidate.unit = normalized.unit;
  if (raw.currency !== undefined) updateCandidate.currency = normalized.currency;
  if (raw.customMade !== undefined || raw.custom_made !== undefined) updateCandidate.customMade = normalized.customMade;
  if (raw.featured !== undefined) updateCandidate.featured = normalized.featured;
  if (raw.customMeasurementAvailable !== undefined || raw.custom_measurement_available !== undefined) updateCandidate.customMeasurementAvailable = normalized.customMeasurementAvailable;
  if (raw.active !== undefined) updateCandidate.active = normalized.active;
  if (raw.displayOrder !== undefined || raw.display_order !== undefined) updateCandidate.displayOrder = normalized.displayOrder;
  if (raw.spaceSlugs !== undefined || raw.space_slugs !== undefined) updateCandidate.spaceSlugs = normalized.spaceSlugs;
  if (raw.images !== undefined || raw.main_image !== undefined || raw.mainImage !== undefined) updateCandidate.images = normalized.images;
  if (raw.variants !== undefined) updateCandidate.variants = normalized.variants;
  if (raw.specifications !== undefined) updateCandidate.specifications = normalized.specifications;
  if (raw.customizationConfigs !== undefined || raw.customization_configs !== undefined) updateCandidate.customizationConfigs = normalized.customizationConfigs;

  return UpdateProductInputSchema.parse(updateCandidate);
}
```

- [ ] **Step 2: Create unit test `scripts/test_catalog_admin_mapper.ts`**

```typescript
import {
  normalizeCreateProductPayload,
  normalizeUpdateProductPayload,
} from '../src/lib/catalog/admin-mapper';

async function run() {
  console.log('Testing Admin Mapper Normalization...');

  // Test 1: Full snake_case payload mapping
  const legacyPayload = {
    name: 'Royale Velvet Cushion',
    category_id: 'cat-10',
    subcategory_id: 'sub-cushion-velvet',
    base_price: '1299',
    main_image: '/images/cushion-main.jpg',
    gallery_images: ['/images/cushion-1.jpg', '/images/cushion-2.jpg'],
    custom_made: 1,
    custom_measurement_available: 0,
    active: 1,
    variants: [
      {
        name: 'Emerald Green',
        variant_type: 'color',
        color_hex: '#005522',
        price_adjustment: '200',
        in_stock: 1,
      },
    ],
    specifications: [
      { label: 'Material', value: '100% Cotton Velvet' },
    ],
  };

  const normalized = normalizeCreateProductPayload(legacyPayload);

  if (normalized.categoryId !== 'cat-10') throw new Error('Failed category_id mapping');
  if (normalized.subcategoryId !== 'sub-cushion-velvet') throw new Error('Failed subcategory_id mapping');
  if (normalized.price !== 1299) throw new Error('Failed base_price conversion');
  if (normalized.customMade !== true) throw new Error('Failed custom_made conversion');
  if (normalized.images.length !== 3) throw new Error('Failed main + gallery image merging');
  if (normalized.images[0].url !== '/images/cushion-main.jpg' || !normalized.images[0].isMain) {
    throw new Error('Main image not marked correctly');
  }
  if (normalized.variants[0].priceAdjustment !== 200) throw new Error('Variant priceAdjustment failed');
  console.log('✓ Legacy snake_case payload normalized to domain model');

  // Test 2: Update payload normalization
  const updatePayload = {
    base_price: 1599,
    featured: 1,
  };
  const updateNormalized = normalizeUpdateProductPayload(updatePayload);
  if (updateNormalized.price !== 1599) throw new Error('Update price failed');
  if (updateNormalized.featured !== true) throw new Error('Update featured failed');
  if (updateNormalized.name !== undefined) throw new Error('Unmodified name should be undefined');
  console.log('✓ Partial update payload normalized correctly');

  console.log('ALL MAPPER TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run mapper test**

Run:
```bash
npx tsx scripts/test_catalog_admin_mapper.ts
```

- [ ] **Step 4: Commit Task 2**

```bash
git add src/lib/catalog/admin-mapper.ts scripts/test_catalog_admin_mapper.ts
git commit -m "feat(catalog): add backward-compatible admin input normalization adapter"
```

---

### Task 3: Transaction Batch Execution Engine

**Files:**
- Create: `src/lib/catalog/admin-engine.ts`
- Test: `scripts/test_catalog_admin_transactions.ts`

**Interfaces:**
- Consumes: `DatabaseClient`, `BatchStatement` from `@/lib/db`, `CreateProductInput`, `UpdateProductInput`, `DeleteProductOptions`
- Produces: `createCatalogAdmin(db: DatabaseClient): CatalogAdminService`

- [ ] **Step 1: Create `src/lib/catalog/admin-engine.ts`**

Implement atomic batch assembly and execution for `createProduct`, `updateProduct`, and `deleteProduct`:

```typescript
import { DatabaseClient, BatchStatement } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { CATEGORIES } from '@/lib/data/categories';
import {
  CatalogAdminService,
  CreateProductInput,
  UpdateProductInput,
  DeleteProductOptions,
  ProductMutationResult,
  ProductNotFoundError,
} from './admin-types';

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createCatalogAdmin(db: DatabaseClient): CatalogAdminService {
  return {
    async createProduct(input: CreateProductInput): Promise<ProductMutationResult> {
      await ensureDatabaseSchema(db);

      // 1. Resolve Category ID (foreign key integrity)
      const rawCat = input.categoryId.trim();
      let resolvedCategoryId = rawCat;
      let categorySlug = rawCat;
      const catStatements: BatchStatement[] = [];

      const catRow = await db.queryOne<{ id: string; slug: string }>(
        'SELECT id, slug FROM categories WHERE id = ? OR slug = ? LIMIT 1',
        [rawCat, rawCat]
      );

      if (catRow) {
        resolvedCategoryId = catRow.id;
        categorySlug = catRow.slug;
      } else {
        const matchedStatic = CATEGORIES.find((c) => c.id === rawCat || c.slug === rawCat);
        if (matchedStatic) {
          catStatements.push({
            sql: `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
                  VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?)`,
            params: [
              matchedStatic.id,
              matchedStatic.name,
              matchedStatic.slug,
              matchedStatic.tagline,
              matchedStatic.description,
              matchedStatic.image,
              matchedStatic.isCustomizable ? 1 : 0,
            ],
          });
          resolvedCategoryId = matchedStatic.id;
          categorySlug = matchedStatic.slug;
        } else {
          const cleanCatName = rawCat.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          catStatements.push({
            sql: `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
                  VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, 0)`,
            params: [
              rawCat,
              cleanCatName,
              rawCat,
              `Bespoke ${cleanCatName}`,
              `Collection of ${cleanCatName}`,
              '/images/hero/living_room.jpg',
            ],
          });
          resolvedCategoryId = rawCat;
          categorySlug = rawCat;
        }
      }

      // 2. Resolve Subcategory ID safely
      let resolvedSubcategoryId: string | null = null;
      let subcategorySlug: string | null = null;
      if (input.subcategoryId && input.subcategoryId.trim()) {
        const cleanSub = input.subcategoryId.trim();
        const subRow = await db.queryOne<{ id: string; slug: string }>(
          'SELECT id, slug FROM subcategories WHERE id = ? OR slug = ? LIMIT 1',
          [cleanSub, cleanSub]
        );
        if (subRow) {
          resolvedSubcategoryId = subRow.id;
          subcategorySlug = subRow.slug;
        }
      }

      // 3. Compute Unique Slug
      let cleanSlug = slugify(input.slug || input.name);
      if (!cleanSlug) {
        cleanSlug = `product-${Date.now().toString().slice(-6)}`;
      }
      let finalSlug = cleanSlug;
      let suffix = 2;
      while (await db.queryOne('SELECT id FROM products WHERE slug = ?', [finalSlug])) {
        finalSlug = `${cleanSlug}-${suffix}`;
        suffix++;
      }

      const productId = `prod-${finalSlug}-${Date.now().toString().slice(-4)}`;
      const statements: BatchStatement[] = [...catStatements];

      // 4. Core Product Insert Statement
      statements.push({
        sql: `INSERT INTO products (
          id, category_id, subcategory_id, name, display_name, slug, description, short_description,
          product_type, pricing_type, base_price, starting_price, unit, custom_made, featured,
          custom_measurement_available, active, display_order, currency, space_slugs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [
          productId,
          resolvedCategoryId,
          resolvedSubcategoryId,
          input.name.trim(),
          input.displayName?.trim() || input.name.trim(),
          finalSlug,
          input.description?.trim() || '',
          input.shortDescription?.trim() || input.description?.trim() || '',
          input.productType,
          input.pricingType,
          input.price,
          input.startingPrice ? 1 : 0,
          input.unit.trim(),
          input.customMade ? 1 : 0,
          input.featured ? 1 : 0,
          input.customMeasurementAvailable ? 1 : 0,
          input.active ? 1 : 0,
          input.displayOrder,
          input.currency,
          JSON.stringify(input.spaceSlugs || []),
        ],
      });

      // 5. Child Inserts: Images
      input.images.forEach((img, idx) => {
        statements.push({
          sql: `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          params: [
            img.id || `img-${productId}-${idx}`,
            productId,
            img.url,
            img.altText || input.name.trim(),
            img.displayOrder ?? idx,
            img.isMain ? 1 : 0,
            img.active ? 1 : 0,
          ],
        });
      });

      // 6. Child Inserts: Variants
      input.variants.forEach((v, idx) => {
        statements.push({
          sql: `INSERT INTO product_variants (
            id, product_id, name, variant_type, sku, color_hex, thumbnail_image,
            preview_image, price_adjustment, in_stock, attributes, display_order, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            v.id || `var-${productId}-${idx}`,
            productId,
            v.name,
            v.variantType,
            v.sku || `${finalSlug}-${idx + 1}`,
            v.colorHex || null,
            v.thumbnailImage || null,
            v.previewImage || null,
            v.priceAdjustment,
            v.inStock ? 1 : 0,
            JSON.stringify(v.attributes || {}),
            v.displayOrder ?? idx,
            v.active ? 1 : 0,
          ],
        });
      });

      // 7. Child Inserts: Specifications
      input.specifications.forEach((s, idx) => {
        statements.push({
          sql: `INSERT INTO product_specifications (id, product_id, label, value, display_order)
                VALUES (?, ?, ?, ?, ?)`,
          params: [
            s.id || `spec-${productId}-${idx}`,
            productId,
            s.label.trim(),
            s.value.trim(),
            s.displayOrder ?? idx,
          ],
        });
      });

      // 8. Child Inserts: Customization Configs
      input.customizationConfigs.forEach((c, idx) => {
        const optionsFormatted = c.options ? (typeof c.options === 'string' ? c.options : JSON.stringify(c.options)) : null;
        statements.push({
          sql: `INSERT INTO customization_configs (
            id, product_id, field_key, field_label, field_type, options, default_value,
            min_value, max_value, unit, is_required, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params: [
            c.id || `cfg-${productId}-${idx}`,
            productId,
            c.fieldKey.trim(),
            c.fieldLabel?.trim() || c.fieldKey.trim(),
            c.fieldType,
            optionsFormatted,
            c.defaultValue || null,
            c.minValue ?? null,
            c.maxValue ?? null,
            c.unit || null,
            c.isRequired ? 1 : 0,
            c.displayOrder ?? idx,
          ],
        });
      });

      // 9. Execute Atomic Transaction
      await db.batch(statements);

      return {
        success: true,
        id: productId,
        slug: finalSlug,
        action: 'created',
        affectedPaths: [
          '/products',
          `/products/${finalSlug}`,
          '/categories',
          `/categories/${categorySlug}`,
          ...(subcategorySlug ? [`/categories/${categorySlug}/${subcategorySlug}`] : []),
        ],
      };
    },

    async updateProduct(id: string, input: UpdateProductInput): Promise<ProductMutationResult> {
      await ensureDatabaseSchema(db);

      const existing = await db.queryOne<{
        id: string;
        category_id: string;
        subcategory_id: string | null;
        slug: string;
      }>('SELECT id, category_id, subcategory_id, slug FROM products WHERE id = ?', [id]);

      if (!existing) {
        throw new ProductNotFoundError(id);
      }

      // 1. Resolve Category
      let targetCatId = existing.category_id;
      let categorySlug = existing.category_id;
      if (input.categoryId !== undefined) {
        const rawCat = input.categoryId.trim();
        const catRow = await db.queryOne<{ id: string; slug: string }>(
          'SELECT id, slug FROM categories WHERE id = ? OR slug = ? LIMIT 1',
          [rawCat, rawCat]
        );
        if (catRow) {
          targetCatId = catRow.id;
          categorySlug = catRow.slug;
        } else {
          targetCatId = rawCat;
          categorySlug = rawCat;
        }
      }

      // 2. Resolve Subcategory
      let targetSubcatId = existing.subcategory_id;
      let subcategorySlug: string | null = null;
      if (input.subcategoryId !== undefined) {
        if (!input.subcategoryId || !input.subcategoryId.trim()) {
          targetSubcatId = null;
        } else {
          const cleanSub = input.subcategoryId.trim();
          const subRow = await db.queryOne<{ id: string; slug: string }>(
            'SELECT id, slug FROM subcategories WHERE id = ? OR slug = ? LIMIT 1',
            [cleanSub, cleanSub]
          );
          if (subRow) {
            targetSubcatId = subRow.id;
            subcategorySlug = subRow.slug;
          }
        }
      }

      // 3. Resolve Slug Uniqueness
      let targetSlug = existing.slug;
      if (input.slug && input.slug.trim()) {
        const cleanSlug = slugify(input.slug);
        if (cleanSlug && cleanSlug !== existing.slug) {
          let uniqueSlug = cleanSlug;
          let suffix = 2;
          while (await db.queryOne('SELECT id FROM products WHERE slug = ? AND id != ?', [uniqueSlug, id])) {
            uniqueSlug = `${cleanSlug}-${suffix}`;
            suffix++;
          }
          targetSlug = uniqueSlug;
        }
      }

      const statements: BatchStatement[] = [];

      // 4. Update Core Product
      statements.push({
        sql: `UPDATE products SET
          category_id = COALESCE(?, category_id),
          subcategory_id = ?,
          name = COALESCE(?, name),
          display_name = COALESCE(?, display_name),
          slug = ?,
          description = COALESCE(?, description),
          short_description = COALESCE(?, short_description),
          product_type = COALESCE(?, product_type),
          pricing_type = COALESCE(?, pricing_type),
          base_price = COALESCE(?, base_price),
          starting_price = COALESCE(?, starting_price),
          unit = COALESCE(?, unit),
          custom_made = COALESCE(?, custom_made),
          featured = COALESCE(?, featured),
          custom_measurement_available = COALESCE(?, custom_measurement_available),
          active = COALESCE(?, active),
          display_order = COALESCE(?, display_order),
          currency = COALESCE(?, currency),
          space_slugs = COALESCE(?, space_slugs),
          updated_at = datetime('now')
        WHERE id = ?`,
        params: [
          targetCatId,
          targetSubcatId,
          input.name?.trim(),
          input.displayName?.trim(),
          targetSlug,
          input.description?.trim(),
          input.shortDescription?.trim(),
          input.productType,
          input.pricingType,
          input.price,
          input.startingPrice !== undefined ? (input.startingPrice ? 1 : 0) : null,
          input.unit?.trim(),
          input.customMade !== undefined ? (input.customMade ? 1 : 0) : null,
          input.featured !== undefined ? (input.featured ? 1 : 0) : null,
          input.customMeasurementAvailable !== undefined ? (input.customMeasurementAvailable ? 1 : 0) : null,
          input.active !== undefined ? (input.active ? 1 : 0) : null,
          input.displayOrder,
          input.currency,
          input.spaceSlugs ? JSON.stringify(input.spaceSlugs) : null,
          id,
        ],
      });

      // 5. Replace Images atomically if provided
      if (input.images !== undefined) {
        statements.push({
          sql: 'DELETE FROM product_images WHERE product_id = ?',
          params: [id],
        });
        input.images.forEach((img, idx) => {
          statements.push({
            sql: `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            params: [
              img.id || `img-${id}-${idx}-${Date.now().toString().slice(-4)}`,
              id,
              img.url,
              img.altText || input.name || '',
              img.displayOrder ?? idx,
              img.isMain ? 1 : 0,
              img.active ? 1 : 0,
            ],
          });
        });
      }

      // 6. Replace Variants atomically if provided
      if (input.variants !== undefined) {
        statements.push({
          sql: 'DELETE FROM product_variants WHERE product_id = ?',
          params: [id],
        });
        input.variants.forEach((v, idx) => {
          statements.push({
            sql: `INSERT INTO product_variants (
              id, product_id, name, variant_type, sku, color_hex, thumbnail_image,
              preview_image, price_adjustment, in_stock, attributes, display_order, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              v.id || `var-${id}-${idx}-${Date.now().toString().slice(-4)}`,
              id,
              v.name,
              v.variantType,
              v.sku || `${targetSlug}-${idx + 1}`,
              v.colorHex || null,
              v.thumbnailImage || null,
              v.previewImage || null,
              v.priceAdjustment,
              v.inStock ? 1 : 0,
              JSON.stringify(v.attributes || {}),
              v.displayOrder ?? idx,
              v.active ? 1 : 0,
            ],
          });
        });
      }

      // 7. Replace Specifications atomically if provided
      if (input.specifications !== undefined) {
        statements.push({
          sql: 'DELETE FROM product_specifications WHERE product_id = ?',
          params: [id],
        });
        input.specifications.forEach((s, idx) => {
          statements.push({
            sql: `INSERT INTO product_specifications (id, product_id, label, value, display_order)
                  VALUES (?, ?, ?, ?, ?)`,
            params: [
              s.id || `spec-${id}-${idx}-${Date.now().toString().slice(-4)}`,
              id,
              s.label.trim(),
              s.value.trim(),
              s.displayOrder ?? idx,
            ],
          });
        });
      }

      // 8. Replace Customization Configs atomically if provided
      if (input.customizationConfigs !== undefined) {
        statements.push({
          sql: 'DELETE FROM customization_configs WHERE product_id = ?',
          params: [id],
        });
        input.customizationConfigs.forEach((c, idx) => {
          const optionsFormatted = c.options ? (typeof c.options === 'string' ? c.options : JSON.stringify(c.options)) : null;
          statements.push({
            sql: `INSERT INTO customization_configs (
              id, product_id, field_key, field_label, field_type, options, default_value,
              min_value, max_value, unit, is_required, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              c.id || `cfg-${id}-${idx}-${Date.now().toString().slice(-4)}`,
              id,
              c.fieldKey.trim(),
              c.fieldLabel?.trim() || c.fieldKey.trim(),
              c.fieldType,
              optionsFormatted,
              c.defaultValue || null,
              c.minValue ?? null,
              c.maxValue ?? null,
              c.unit || null,
              c.isRequired ? 1 : 0,
              c.displayOrder ?? idx,
            ],
          });
        });
      }

      // 9. Execute Atomic Transaction
      await db.batch(statements);

      return {
        success: true,
        id,
        slug: targetSlug,
        action: 'updated',
        affectedPaths: [
          '/products',
          `/products/${existing.slug}`,
          ...(targetSlug !== existing.slug ? [`/products/${targetSlug}`] : []),
          '/categories',
          `/categories/${categorySlug}`,
          ...(subcategorySlug ? [`/categories/${categorySlug}/${subcategorySlug}`] : []),
        ],
      };
    },

    async deleteProduct(id: string, options?: DeleteProductOptions): Promise<ProductMutationResult> {
      await ensureDatabaseSchema(db);

      const existing = await db.queryOne<{
        id: string;
        slug: string;
        category_id: string;
      }>('SELECT id, slug, category_id FROM products WHERE id = ?', [id]);

      if (!existing) {
        throw new ProductNotFoundError(id);
      }

      const permanent = options?.permanent === true;
      if (permanent) {
        await db.batch([
          { sql: 'DELETE FROM product_images WHERE product_id = ?', params: [id] },
          { sql: 'DELETE FROM product_variants WHERE product_id = ?', params: [id] },
          { sql: 'DELETE FROM product_specifications WHERE product_id = ?', params: [id] },
          { sql: 'DELETE FROM customization_configs WHERE product_id = ?', params: [id] },
          { sql: 'DELETE FROM products WHERE id = ?', params: [id] },
        ]);
      } else {
        await db.execute("UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?", [id]);
      }

      return {
        success: true,
        id,
        slug: existing.slug,
        action: permanent ? 'deleted' : 'deactivated',
        affectedPaths: [
          '/products',
          `/products/${existing.slug}`,
          '/categories',
          `/categories/${existing.category_id}`,
        ],
      };
    },
  };
}
```

- [ ] **Step 2: Create transaction rollback verification test `scripts/test_catalog_admin_transactions.ts`**

```typescript
import { getDatabase } from '../src/lib/db';
import { createCatalogAdmin } from '../src/lib/catalog/admin-engine';
import { ProductNotFoundError } from '../src/lib/catalog/admin-types';

async function run() {
  console.log('Testing Catalog Admin Transaction Isolation & Atomic Rollback...');
  const db = getDatabase();
  const admin = createCatalogAdmin(db);

  const testSlug = `tx-test-${Date.now().toString().slice(-5)}`;

  // Test 1: Atomic Creation
  const createRes = await admin.createProduct({
    name: 'Transaction Isolation Test Drape',
    slug: testSlug,
    categoryId: 'curtains-drapes',
    price: 3200,
    images: [
      { url: '/img/tx1.jpg', isMain: true },
      { url: '/img/tx2.jpg', isMain: false },
    ],
    variants: [
      { name: 'Opal White', variantType: 'color', priceAdjustment: 0 },
      { name: 'Champagne Gold', variantType: 'color', priceAdjustment: 400 },
    ],
    specifications: [
      { label: 'Weave', value: 'Jacquard' },
    ],
    customizationConfigs: [
      { fieldKey: 'pleat_style', fieldLabel: 'Pleat Style', fieldType: 'select', options: ['Pinch', 'Ripplefold'] },
    ],
  });

  if (!createRes.success || !createRes.id) {
    throw new Error('Atomic product creation failed');
  }
  const prodId = createRes.id;
  console.log(`✓ Product created atomically with ID: ${prodId}`);

  // Verify all child rows exist
  const [imgs, vars, specs, cfgs] = await Promise.all([
    db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_specifications WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM customization_configs WHERE product_id = ?', [prodId]),
  ]);

  if (imgs.length !== 2) throw new Error(`Expected 2 images, got ${imgs.length}`);
  if (vars.length !== 2) throw new Error(`Expected 2 variants, got ${vars.length}`);
  if (specs.length !== 1) throw new Error(`Expected 1 spec, got ${specs.length}`);
  if (cfgs.length !== 1) throw new Error(`Expected 1 config, got ${cfgs.length}`);
  console.log('✓ All 6 relational rows verified in database');

  // Test 2: Atomic Update
  const updateRes = await admin.updateProduct(prodId, {
    price: 3500,
    images: [{ url: '/img/updated-main.jpg', isMain: true }],
    variants: [{ name: 'Solo Variant', variantType: 'material' }],
  });
  if (!updateRes.success) throw new Error('Update failed');

  const updatedImgs = await db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]);
  const updatedVars = await db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]);
  if (updatedImgs.length !== 1 || (updatedImgs[0] as any).image_url !== '/img/updated-main.jpg') {
    throw new Error('Images were not atomically replaced');
  }
  if (updatedVars.length !== 1 || (updatedVars[0] as any).name !== 'Solo Variant') {
    throw new Error('Variants were not atomically replaced');
  }
  console.log('✓ Relational children atomically replaced on update');

  // Test 3: Transaction Rollback Proof (Batch Isolation)
  console.log('Verifying transaction rollback atomicity...');
  const rollbackId = `prod-rollback-${Date.now().toString().slice(-4)}`;
  let batchFailed = false;
  try {
    await db.batch([
      {
        sql: `INSERT INTO products (id, category_id, name, slug, price, active, created_at, updated_at)
              VALUES (?, 'curtains-drapes', 'Rollback Target', ?, 1000, 1, datetime('now'), datetime('now'))`,
        params: [rollbackId, `rollback-slug-${Date.now()}`],
      },
      {
        sql: 'INSERT INTO non_existent_table_designed_to_fail (col) VALUES (1)',
        params: [],
      },
    ]);
  } catch {
    batchFailed = true;
  }

  if (!batchFailed) {
    throw new Error('Expected batch to fail on invalid table');
  }

  const rolledBackRow = await db.queryOne('SELECT * FROM products WHERE id = ?', [rollbackId]);
  if (rolledBackRow) {
    throw new Error('CRITICAL FAILURE: Product row was NOT rolled back!');
  }
  console.log('✓ Transaction rollback verified: 0 partial writes on batch failure');

  // Test 4: Permanent Cascade Delete
  await admin.deleteProduct(prodId, { permanent: true });
  const [deletedProd, remImgs, remVars] = await Promise.all([
    db.queryOne('SELECT * FROM products WHERE id = ?', [prodId]),
    db.query('SELECT * FROM product_images WHERE product_id = ?', [prodId]),
    db.query('SELECT * FROM product_variants WHERE product_id = ?', [prodId]),
  ]);
  if (deletedProd !== null || remImgs.length > 0 || remVars.length > 0) {
    throw new Error('Permanent cascade deletion failed');
  }
  console.log('✓ Permanent cascade delete verified: zero orphaned records');

  console.log('ALL TRANSACTION ENGINE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run transaction engine tests**

Run:
```bash
npx tsx scripts/test_catalog_admin_transactions.ts
```

- [ ] **Step 4: Commit Task 3**

```bash
git add src/lib/catalog/admin-engine.ts scripts/test_catalog_admin_transactions.ts
git commit -m "feat(catalog): implement atomic transaction batch execution engine with rollback isolation"
```

---

### Task 4: Public Seam Integration & Request Re-exports

**Files:**
- Modify: `src/lib/catalog/index.ts`
- Test: `scripts/test_catalog_exports.ts`

**Interfaces:**
- Produces: `createCatalogAdmin`, `createProduct`, `updateProduct`, `deleteProduct` exported from `@/lib/catalog`

- [ ] **Step 1: Update `src/lib/catalog/index.ts`**

Export the new administrative mutation seam alongside the existing query seam:

```typescript
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
  getCCatalogAdminInstance().createProduct(input);

export const updateProduct = (id: string, input: UpdateProductInput): Promise<ProductMutationResult> =>
  getCatalogAdminInstance().updateProduct(id, input);

export const deleteProduct = (id: string, options?: DeleteProductOptions): Promise<ProductMutationResult> =>
  getCatalogAdminInstance().deleteProduct(id, options);
```

*(Note typo fix in snippet: use `getCatalogAdminInstance()`)*

- [ ] **Step 2: Create verification script `scripts/test_catalog_exports.ts`**

```typescript
import {
  getProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCatalogAdmin,
  ProductNotFoundError,
} from '../src/lib/catalog';

async function run() {
  console.log('Testing Public @/lib/catalog Seam Exports...');

  if (typeof createProduct !== 'function') throw new Error('createProduct is not exported');
  if (typeof updateProduct !== 'function') throw new Error('updateProduct is not exported');
  if (typeof deleteProduct !== 'function') throw new Error('deleteProduct is not exported');
  if (typeof createCatalogAdmin !== 'function') throw new Error('createCatalogAdmin is not exported');
  if (typeof getProduct !== 'function') throw new Error('getProduct is not exported');

  console.log('✓ All Catalog query and mutation exports verified');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 3: Run export test**

Run:
```bash
npx tsx scripts/test_catalog_exports.ts
```

- [ ] **Step 4: Commit Task 4**

```bash
git add src/lib/catalog/index.ts scripts/test_catalog_exports.ts
git commit -m "feat(catalog): export administrative mutation seam from @/lib/catalog"
```

---

### Task 5: Refactor Admin API Route Handlers

**Files:**
- Modify: `src/app/api/admin/products/route.ts`
- Modify: `src/app/api/admin/products/[id]/route.ts`
- Test: `scripts/test_admin_products_api.ts`

**Interfaces:**
- Refactors `POST /api/admin/products`, `PUT /api/admin/products/[id]`, and `DELETE /api/admin/products/[id]` to consume `@/lib/catalog` and trigger `revalidatePath`.

- [ ] **Step 1: Refactor `src/app/api/admin/products/route.ts`**

Replace procedural SQL in `POST` with the atomic seam and path revalidations:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { DbProduct } from '@/lib/db/types';
import { createProduct, normalizeCreateProductPayload } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id') || searchParams.get('categoryId');
  const activeParam = searchParams.get('active');
  const featuredParam = searchParams.get('featured');
  const search = searchParams.get('search');

  try {
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    let sql = `
      SELECT p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND active = 1 ORDER BY is_main DESC, display_order ASC LIMIT 1) as main_image,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND active = 1) as variant_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories s ON p.subcategory_id = s.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (categoryId) {
      sql += ' AND (p.category_id = ? OR c.slug = ?)';
      params.push(categoryId, categoryId);
    }

    if (activeParam !== null) {
      sql += ' AND p.active = ?';
      params.push(activeParam === '1' || activeParam === 'true' ? 1 : 0);
    }

    if (featuredParam !== null) {
      sql += ' AND p.featured = ?';
      params.push(featuredParam === '1' || featuredParam === 'true' ? 1 : 0);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.slug LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.display_order ASC, p.created_at DESC';

    const products = await db.query<
      DbProduct & {
        category_name: string;
        category_slug: string;
        subcategory_name?: string;
        main_image?: string;
        variant_count: number;
      }
    >(sql, params);

    return NextResponse.json(
      { data: products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const input = normalizeCreateProductPayload(rawBody);
    const result = await createProduct(input);

    for (const path of result.affectedPaths) {
      revalidatePath(path);
    }

    return NextResponse.json({ success: true, id: result.id, slug: result.slug });
  } catch (error) {
    console.error('Admin POST product error:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Refactor `src/app/api/admin/products/[id]/route.ts`**

Replace procedural SQL in `PUT` and `DELETE` with the atomic seam and path revalidations:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import {
  DbProduct,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
  DbCustomizationConfig,
} from '@/lib/db/types';
import {
  updateProduct,
  deleteProduct,
  normalizeUpdateProductPayload,
  ProductNotFoundError,
} from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    const product = await db.queryOne<DbProduct>(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const [images, variants, specifications, customization_configs] = await Promise.all([
      db.query<DbProductImage>(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbProductVariant>(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbProductSpecification>(
        'SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
      db.query<DbCustomizationConfig>(
        'SELECT * FROM customization_configs WHERE product_id = ? ORDER BY display_order ASC',
        [id]
      ),
    ]);

    return NextResponse.json(
      {
        data: {
          ...product,
          images: images || [],
          variants: variants || [],
          specifications: specifications || [],
          customization_configs: customization_configs || [],
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Admin GET product by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const rawBody = await req.json();
    const input = normalizeUpdateProductPayload(rawBody);
    const result = await updateProduct(id, input);

    for (const path of result.affectedPaths) {
      revalidatePath(path);
    }

    return NextResponse.json({ success: true, id: result.id, slug: result.slug });
  } catch (error) {
    console.error('Admin PUT product error:', error);
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAuthorized = await verifyAdminRequest(req);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';
    const result = await deleteProduct(id, { permanent });

    for (const path of result.affectedPaths) {
      revalidatePath(path);
    }

    return NextResponse.json({
      success: true,
      deleted: result.action === 'deleted',
      deactivated: result.action === 'deactivated',
    });
  } catch (error) {
    console.error('Admin DELETE product error:', error);
    if (error instanceof ProductNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create API simulation test `scripts/test_admin_products_api.ts`**

```typescript
import { NextRequest } from 'next/server';
import { POST as createProductRoute } from '../src/app/api/admin/products/route';
import { PUT as updateProductRoute, DELETE as deleteProductRoute } from '../src/app/api/admin/products/[id]/route';

// Set test environment authorization cookie/header
process.env.ADMIN_SECRET = 'test-secret-key';

async function run() {
  console.log('Testing Admin Product API Route Handlers...');

  // 1. Test POST /api/admin/products
  const createPayload = {
    name: 'API Route Test Fabric',
    category_id: 'sofa-fabrics-upholstery',
    base_price: 2400,
    main_image: '/images/test-fabric.jpg',
  };

  const postReq = new NextRequest('http://localhost:3000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer test-secret-key',
    },
    body: JSON.stringify(createPayload),
  });

  const postRes = await createProductRoute(postReq);
  const postData = await postRes.json();
  if (postRes.status !== 200 || !postData.success || !postData.id) {
    throw new Error('API POST product failed: ' + JSON.stringify(postData));
  }
  const createdId = postData.id;
  console.log(`✓ POST /api/admin/products returned 200 OK with ID: ${createdId}`);

  // 2. Test PUT /api/admin/products/[id]
  const putReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer test-secret-key',
    },
    body: JSON.stringify({ base_price: 2800 }),
  });

  const putRes = await updateProductRoute(putReq, { params: Promise.resolve({ id: createdId }) });
  const putData = await putRes.json();
  if (putRes.status !== 200 || !putData.success) {
    throw new Error('API PUT product failed: ' + JSON.stringify(putData));
  }
  console.log('✓ PUT /api/admin/products/[id] returned 200 OK');

  // 3. Test DELETE /api/admin/products/[id]
  const delReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdId}?permanent=true`, {
    method: 'DELETE',
    headers: {
      'authorization': 'Bearer test-secret-key',
    },
  });

  const delRes = await deleteProductRoute(delReq, { params: Promise.resolve({ id: createdId }) });
  const delData = await delRes.json();
  if (delRes.status !== 200 || !delData.success || !delData.deleted) {
    throw new Error('API DELETE product failed: ' + JSON.stringify(delData));
  }
  console.log('✓ DELETE /api/admin/products/[id] returned 200 OK');

  console.log('ALL API ROUTE TESTS PASSED');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 4: Run API route test**

Run:
```bash
npx tsx scripts/test_admin_products_api.ts
```

- [ ] **Step 5: Commit Task 5**

```bash
git add src/app/api/admin/products/route.ts src/app/api/admin/products/[id]/route.ts scripts/test_admin_products_api.ts
git commit -m "refactor(admin): delegate product route mutations to atomic catalog seam"
```

---

### Task 6: End-to-End System Audit & Production Build Verification

**Files:**
- Create: `scripts/verify_deep_product_admin_seam.ts`

**Interfaces:**
- End-to-end integration audit covering:
  1. Transaction isolation with multi-table entity graphs.
  2. Rollback verification on synthetic statement failure.
  3. Form input backward compatibility.
  4. Full Next.js production build (`npm run build`).

- [ ] **Step 1: Create verification script `scripts/verify_deep_product_admin_seam.ts`**

```typescript
import { getDatabase } from '../src/lib/db';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  listProducts,
} from '../src/lib/catalog';

async function run() {
  console.log('==================================================');
  console.log('E2E Audit: Deep Product Admin Seam & Transactions');
  console.log('==================================================');

  const db = getDatabase();
  const slug = `e2e-audit-${Date.now().toString().slice(-5)}`;

  // 1. Create a rich product graph
  console.log('\n[1/4] Creating product graph atomically...');
  const res = await createProduct({
    name: 'Atelier Cashmere Throw',
    slug,
    categoryId: 'cushions-pillows',
    price: 6800,
    featured: true,
    images: [
      { url: '/images/hero/cashmere-1.jpg', isMain: true },
      { url: '/images/hero/cashmere-2.jpg', isMain: false },
    ],
    variants: [
      { name: 'Oatmeal', variantType: 'color', colorHex: '#D8C5A8', inStock: true },
      { name: 'Charcoal', variantType: 'color', colorHex: '#2B2B2B', inStock: true },
      { name: 'Sage', variantType: 'color', colorHex: '#8A9A86', inStock: false },
    ],
    specifications: [
      { label: 'Origin', value: 'Mongolian Cashmere' },
      { label: 'Care', value: 'Dry Clean Only' },
    ],
    customizationConfigs: [
      { fieldKey: 'monogram', fieldLabel: 'Bespoke Monogram', fieldType: 'text', isRequired: false },
    ],
  });

  const productId = res.id;
  console.log(`✓ Product created with ID: ${productId}, slug: ${res.slug}`);

  // 2. Query product through public storefront query seam
  console.log('\n[2/4] Verifying visibility in public storefront seam...');
  const fetched = await getProduct(res.slug);
  if (!fetched) throw new Error('Product not visible via getProduct');
  if (fetched.price !== 6800) throw new Error('Incorrect price in fetched product');
  if (fetched.variations.length !== 3) throw new Error(`Expected 3 variations, got ${fetched.variations.length}`);
  if (fetched.specifications.length !== 2) throw new Error(`Expected 2 specifications, got ${fetched.specifications.length}`);
  console.log('✓ Storefront query seam cleanly reads newly created product graph');

  // 3. Atomically update variants & verify clean replacement
  console.log('\n[3/4] Updating variants atomically...');
  await updateProduct(productId, {
    price: 7200,
    variants: [
      { name: 'Ivory White', variantType: 'color', colorHex: '#F5F5F0', inStock: true },
    ],
  });

  const updated = await getProduct(res.slug);
  if (!updated) throw new Error('Product not found after update');
  if (updated.price !== 7200) throw new Error('Price was not updated');
  if (updated.variations.length !== 1 || updated.variations[0].name !== 'Ivory White') {
    throw new Error('Old variants were not cleanly replaced');
  }
  console.log('✓ Variants cleanly replaced without orphaned records');

  // 4. Cascade delete product
  console.log('\n[4/4] Permanently deleting product...');
  await deleteProduct(productId, { permanent: true });
  const afterDelete = await getProduct(res.slug);
  if (afterDelete !== null) throw new Error('Product still exists after permanent delete');
  console.log('✓ Product and all child rows permanently removed');

  console.log('\n==================================================');
  console.log('AUDIT COMPLETE: All seam & transaction tests passed!');
  console.log('==================================================');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run verification script**

Run:
```bash
npx tsx scripts/verify_deep_product_admin_seam.ts
```

- [ ] **Step 3: Run TypeScript compiler check**

Run:
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Run production Next.js build**

Run:
```bash
npm run build
```

- [ ] **Step 5: Final commit**

```bash
git add scripts/verify_deep_product_admin_seam.ts
git commit -m "test(admin): add end-to-end audit suite for deep product admin seam"
```
