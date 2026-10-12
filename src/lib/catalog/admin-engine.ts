import { DatabaseClient, BatchStatement } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { CATEGORIES } from '@/lib/data/categories';
import {
  CatalogAdminService,
  CreateProductInput,
  CreateProductInputSchema,
  UpdateProductInput,
  UpdateProductInputSchema,
  DeleteProductOptions,
  DeleteProductOptionsSchema,
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
    async createProduct(rawInput: CreateProductInput): Promise<ProductMutationResult> {
      const input = CreateProductInputSchema.parse(rawInput);
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

    async updateProduct(id: string, rawInput: UpdateProductInput): Promise<ProductMutationResult> {
      const input = UpdateProductInputSchema.parse(rawInput);
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
          input.name !== undefined ? input.name.trim() : null,
          input.displayName !== undefined ? input.displayName.trim() : null,
          targetSlug,
          input.description !== undefined ? input.description.trim() : null,
          input.shortDescription !== undefined ? input.shortDescription.trim() : null,
          input.productType ?? null,
          input.pricingType ?? null,
          input.price ?? null,
          input.startingPrice !== undefined ? (input.startingPrice ? 1 : 0) : null,
          input.unit !== undefined ? input.unit.trim() : null,
          input.customMade !== undefined ? (input.customMade ? 1 : 0) : null,
          input.featured !== undefined ? (input.featured ? 1 : 0) : null,
          input.customMeasurementAvailable !== undefined ? (input.customMeasurementAvailable ? 1 : 0) : null,
          input.active !== undefined ? (input.active ? 1 : 0) : null,
          input.displayOrder ?? null,
          input.currency ?? null,
          input.spaceSlugs !== undefined ? JSON.stringify(input.spaceSlugs) : null,
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

    async deleteProduct(id: string, rawOptions?: DeleteProductOptions): Promise<ProductMutationResult> {
      const options = DeleteProductOptionsSchema.parse(rawOptions || {});
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
