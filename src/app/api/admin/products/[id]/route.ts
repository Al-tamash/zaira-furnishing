import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { CATEGORIES } from '@/lib/data/categories';
import {
  DbProduct,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
  DbCustomizationConfig,
} from '@/lib/db/types';

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

    return NextResponse.json({
      data: {
        ...product,
        images: images || [],
        variants: variants || [],
        specifications: specifications || [],
        customization_configs: customization_configs || [],
      },
    });
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
    const body = await req.json();

    const {
      category_id,
      subcategory_id,
      name,
      display_name,
      slug,
      description,
      short_description,
      product_type,
      pricing_type,
      base_price,
      starting_price,
      unit,
      custom_made,
      featured,
      custom_measurement_available,
      active,
      display_order,
      currency,
      space_slugs,
      images,
      variants,
      specifications,
      customization_configs,
    } = body;

    const db = getDatabase();
    await ensureDatabaseSchema(db);

    const existing = await db.queryOne<DbProduct>('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 1. Resolve category_id safely
    let targetCatId = existing.category_id;
    if (category_id !== undefined && category_id !== null) {
      const rawCat = String(category_id).trim();
      if (rawCat) {
        const catRow = await db.queryOne<{ id: string }>(
          'SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1',
          [rawCat, rawCat]
        );
        if (catRow) {
          targetCatId = catRow.id;
        } else {
          const matchedStaticCat = CATEGORIES.find((c) => c.id === rawCat || c.slug === rawCat);
          if (matchedStaticCat) {
            await db.execute(
              `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
               VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, ?)`,
              [
                matchedStaticCat.id,
                matchedStaticCat.name,
                matchedStaticCat.slug,
                matchedStaticCat.tagline,
                matchedStaticCat.description,
                matchedStaticCat.image,
                matchedStaticCat.isCustomizable ? 1 : 0,
              ]
            );
            targetCatId = matchedStaticCat.id;
          } else {
            const cleanCatName = rawCat.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            await db.execute(
              `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
               VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, 0)`,
              [rawCat, cleanCatName, rawCat, `Bespoke ${cleanCatName}`, `Collection of ${cleanCatName}`, '/images/hero/living_room.jpg']
            );
            targetCatId = rawCat;
          }
        }
      }
    }

    // 2. Resolve subcategory_id safely (empty string or invalid id becomes NULL)
    let targetSubcatId = existing.subcategory_id;
    if (subcategory_id !== undefined) {
      if (!subcategory_id || typeof subcategory_id !== 'string' || !subcategory_id.trim()) {
        targetSubcatId = null;
      } else {
        const cleanSub = subcategory_id.trim();
        const subRow = await db.queryOne<{ id: string }>(
          'SELECT id FROM subcategories WHERE id = ? OR slug = ? LIMIT 1',
          [cleanSub, cleanSub]
        );
        targetSubcatId = subRow ? subRow.id : null;
      }
    }

    // 3. Resolve slug and uniqueness
    let targetSlug = existing.slug;
    if (slug && typeof slug === 'string' && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

    const spaceSlugsJson = space_slugs ? JSON.stringify(space_slugs) : existing.space_slugs;

    // 4. Update Core Product Table
    await db.execute(
      `UPDATE products SET
        category_id = ?,
        subcategory_id = ?,
        name = ?,
        display_name = ?,
        slug = ?,
        description = ?,
        short_description = ?,
        product_type = ?,
        pricing_type = ?,
        base_price = ?,
        starting_price = ?,
        unit = ?,
        custom_made = ?,
        featured = ?,
        custom_measurement_available = ?,
        active = ?,
        display_order = ?,
        currency = ?,
        space_slugs = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        targetCatId,
        targetSubcatId,
        name !== undefined ? name.trim() : existing.name,
        display_name !== undefined ? display_name.trim() : existing.display_name,
        targetSlug,
        description !== undefined ? description.trim() : existing.description,
        short_description !== undefined ? short_description.trim() : existing.short_description,
        product_type !== undefined ? product_type : existing.product_type,
        pricing_type !== undefined ? pricing_type : existing.pricing_type,
        base_price !== undefined ? Number(base_price) : existing.base_price,
        starting_price !== undefined ? (starting_price ? 1 : 0) : existing.starting_price,
        unit !== undefined ? unit.trim() : existing.unit,
        custom_made !== undefined ? (custom_made ? 1 : 0) : existing.custom_made,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        custom_measurement_available !== undefined
          ? custom_measurement_available
            ? 1
            : 0
          : existing.custom_measurement_available,
        active !== undefined ? (active ? 1 : 0) : existing.active,
        display_order !== undefined ? Number(display_order) : existing.display_order,
        currency !== undefined ? currency : existing.currency,
        spaceSlugsJson,
        id,
      ]
    );

    // 5. Sync Images if provided
    if (Array.isArray(images)) {
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img || !img.image_url) continue;
        const imgId = img.id || `img-${id}-${i}-${Date.now().toString().slice(-4)}`;
        await db.execute(
          `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            imgId,
            id,
            img.image_url,
            img.alt_text || name || existing.name,
            i,
            img.is_main ? 1 : 0,
            img.active !== undefined ? (img.active ? 1 : 0) : 1,
          ]
        );
      }
    }

    // 6. Sync Variants if provided
    const VALID_VARIANT_TYPES = new Set(['color', 'pattern', 'material', 'finish', 'thickness', 'opacity', 'firmness', 'design']);
    if (Array.isArray(variants)) {
      await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      for (let j = 0; j < variants.length; j++) {
        const v = variants[j];
        if (!v) continue;
        const vId = v.id || `var-${id}-${j}-${Date.now().toString().slice(-4)}`;
        const attrJson = typeof v.attributes === 'string' ? v.attributes : JSON.stringify(v.attributes || {});
        const vType = VALID_VARIANT_TYPES.has(v.variant_type) ? v.variant_type : 'color';
        await db.execute(
          `INSERT INTO product_variants (id, product_id, name, variant_type, sku, color_hex, thumbnail_image, preview_image, price_adjustment, in_stock, attributes, display_order, active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            vId,
            id,
            v.name || 'Default Variant',
            vType,
            v.sku || `${targetSlug}-${j}`,
            v.color_hex || null,
            v.thumbnail_image || null,
            v.preview_image || null,
            Number(v.price_adjustment) || 0,
            v.in_stock ? 1 : 0,
            attrJson,
            j,
            v.active !== undefined ? (v.active ? 1 : 0) : 1,
          ]
        );
      }
    }

    // 7. Sync Specifications if provided
    if (Array.isArray(specifications)) {
      await db.execute('DELETE FROM product_specifications WHERE product_id = ?', [id]);
      for (let k = 0; k < specifications.length; k++) {
        const s = specifications[k];
        if (!s || !s.label) continue;
        const sId = s.id || `spec-${id}-${k}-${Date.now().toString().slice(-4)}`;
        await db.execute(
          `INSERT INTO product_specifications (id, product_id, label, value, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [sId, id, s.label?.trim() || '', s.value?.trim() || '', k]
        );
      }
    }

    // 8. Sync Customization Configs if provided
    const VALID_FIELD_TYPES = new Set(['dimension_pair', 'select', 'number', 'text', 'boolean']);
    if (Array.isArray(customization_configs)) {
      await db.execute('DELETE FROM customization_configs WHERE product_id = ?', [id]);
      for (let c = 0; c < customization_configs.length; c++) {
        const cfg = customization_configs[c];
        if (!cfg || !cfg.field_key) continue;
        const cfgId = cfg.id || `cfg-${id}-${c}-${Date.now().toString().slice(-4)}`;
        const fieldType = VALID_FIELD_TYPES.has(cfg.field_type) ? cfg.field_type : 'select';

        let optionsFormatted: string | null = null;
        if (cfg.options) {
          if (Array.isArray(cfg.options)) {
            optionsFormatted = JSON.stringify(cfg.options);
          } else if (typeof cfg.options === 'string') {
            const trimmed = cfg.options.trim();
            if (trimmed.startsWith('[')) {
              optionsFormatted = trimmed;
            } else {
              optionsFormatted = JSON.stringify(trimmed.split(',').map((s: string) => s.trim()).filter(Boolean));
            }
          }
        }

        await db.execute(
          `INSERT INTO customization_configs (id, product_id, field_key, field_label, field_type, options, default_value, min_value, max_value, unit, is_required, display_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cfgId,
            id,
            cfg.field_key.trim(),
            cfg.field_label?.trim() || cfg.field_key.trim(),
            fieldType,
            optionsFormatted,
            cfg.default_value || null,
            cfg.min_value !== undefined && cfg.min_value !== null && cfg.min_value !== '' ? Number(cfg.min_value) : null,
            cfg.max_value !== undefined && cfg.max_value !== null && cfg.max_value !== '' ? Number(cfg.max_value) : null,
            cfg.unit || null,
            cfg.is_required ? 1 : 0,
            c,
          ]
        );
      }
    }

    return NextResponse.json({ success: true, id, slug: targetSlug });
  } catch (error) {
    console.error('Admin PUT product error:', error);
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
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    if (permanent) {
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      await db.execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      await db.execute('DELETE FROM product_specifications WHERE product_id = ?', [id]);
      await db.execute('DELETE FROM customization_configs WHERE product_id = ?', [id]);
      await db.execute('DELETE FROM products WHERE id = ?', [id]);
      return NextResponse.json({ success: true, deleted: true });
    }

    // Soft-deactivate product
    await db.execute("UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?", [id]);

    return NextResponse.json({ success: true, deactivated: true });
  } catch (error) {
    console.error('Admin DELETE product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
