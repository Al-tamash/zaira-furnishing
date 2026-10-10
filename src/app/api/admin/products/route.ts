import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';
import { getDatabase } from '@/lib/db';
import { ensureDatabaseSchema } from '@/lib/db/auto-migrate';
import { CATEGORIES } from '@/lib/data/categories';
import { DbProduct } from '@/lib/db/types';

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

    return NextResponse.json({ data: products });
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
    const body = await req.json();
    const {
      category_id,
      subcategory_id,
      name,
      display_name,
      slug,
      description,
      short_description,
      product_type = 'standard',
      pricing_type = 'fixed',
      base_price,
      starting_price = 0,
      unit = 'piece',
      custom_made = 0,
      featured = 0,
      custom_measurement_available = 0,
      active = 1,
      display_order = 0,
      currency = '₹',
      main_image,
      gallery_images = [],
      images = [],
      variants = [],
      specifications = [],
      customization_configs = [],
      space_slugs = [],
    } = body;

    if (!name || (!name.trim())) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const rawCat = (category_id ? String(category_id).trim() : '') || 'cat-1';
    const db = getDatabase();
    await ensureDatabaseSchema(db);

    // 1. Resolve category_id to guarantee foreign key integrity
    let resolvedCategoryId = rawCat;
    const catRow = await db.queryOne<{ id: string }>(
      'SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1',
      [rawCat, rawCat]
    );

    if (catRow) {
      resolvedCategoryId = catRow.id;
    } else {
      // Check if it matches a known category in our master catalog
      const matchedStaticCat = CATEGORIES.find(
        (c) => c.id === rawCat || c.slug === rawCat
      );
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
        resolvedCategoryId = matchedStaticCat.id;
      } else {
        // Safe auto-creation: Create category entry so foreign key constraint NEVER fails
        const cleanCatName = rawCat.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        await db.execute(
          `INSERT OR IGNORE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable)
           VALUES (?, ?, ?, ?, ?, ?, 0, 1, 1, 0)`,
          [
            rawCat,
            cleanCatName,
            rawCat,
            `Bespoke ${cleanCatName}`,
            `Collection of ${cleanCatName}`,
            '/images/hero/living_room.jpg',
          ]
        );
        resolvedCategoryId = rawCat;
      }
    }

    // 2. Resolve subcategory_id safely
    let resolvedSubcategoryId: string | null = null;
    if (subcategory_id && typeof subcategory_id === 'string' && subcategory_id.trim()) {
      const cleanSub = subcategory_id.trim();
      const subRow = await db.queryOne<{ id: string }>(
        'SELECT id FROM subcategories WHERE id = ? OR slug = ? LIMIT 1',
        [cleanSub, cleanSub]
      );
      if (subRow) {
        resolvedSubcategoryId = subRow.id;
      } else {
        resolvedSubcategoryId = null;
      }
    }

    // 3. Clean and auto-generate unique slug
    let cleanSlug = (slug || name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      cleanSlug = `product-${Date.now().toString().slice(-6)}`;
    }

    let finalSlug = cleanSlug;
    let suffix = 2;
    while (await db.queryOne('SELECT id FROM products WHERE slug = ?', [finalSlug])) {
      finalSlug = `${cleanSlug}-${suffix}`;
      suffix++;
    }

    const id = `prod-${finalSlug}-${Date.now().toString().slice(-4)}`;
    const spaceSlugsJson = JSON.stringify(space_slugs || []);
    const numericBasePrice = isNaN(Number(base_price)) ? 0 : Number(base_price);
    const validProductType = product_type === 'custom_made' ? 'custom_made' : 'standard';

    // 4. Insert Core Product
    await db.execute(
      `INSERT INTO products (
        id, category_id, subcategory_id, name, display_name, slug, description, short_description,
        product_type, pricing_type, base_price, starting_price, unit, custom_made, featured,
        custom_measurement_available, active, display_order, currency, space_slugs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        resolvedCategoryId,
        resolvedSubcategoryId,
        name.trim(),
        display_name?.trim() || name.trim(),
        finalSlug,
        description?.trim() || '',
        short_description?.trim() || description?.trim() || '',
        validProductType,
        pricing_type || 'fixed',
        numericBasePrice,
        starting_price ? 1 : 0,
        unit?.trim() || 'piece',
        custom_made ? 1 : 0,
        featured ? 1 : 0,
        custom_measurement_available ? 1 : 0,
        active ? 1 : 0,
        Number(display_order) || 0,
        currency || '₹',
        spaceSlugsJson,
      ]
    );

    // 5. Save images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img && img.image_url) {
          await db.execute(
            `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [`img-${id}-${i}`, id, img.image_url, img.alt_text || name.trim(), i, img.is_main ? 1 : 0, img.active ?? 1]
          );
        }
      }
    } else {
      if (main_image) {
        await db.execute(
          `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
           VALUES (?, ?, ?, ?, 0, 1, 1)`,
          [`img-${id}-main`, id, main_image, name.trim()]
        );
      }
      if (Array.isArray(gallery_images)) {
        for (let i = 0; i < gallery_images.length; i++) {
          const imgUrl = gallery_images[i];
          if (imgUrl && imgUrl !== main_image) {
            await db.execute(
              `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
               VALUES (?, ?, ?, ?, ?, 0, 1)`,
              [`img-${id}-gal-${i}`, id, imgUrl, name.trim(), i + 1]
            );
          }
        }
      }
    }

    // 6. Save variants safely
    const VALID_VARIANT_TYPES = new Set(['color', 'pattern', 'material', 'finish', 'thickness', 'opacity', 'firmness', 'design']);
    if (Array.isArray(variants)) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!v) continue;
        const vType = VALID_VARIANT_TYPES.has(v.variant_type) ? v.variant_type : 'color';
        await db.execute(
          `INSERT INTO product_variants (
            id, product_id, name, variant_type, sku, color_hex, thumbnail_image,
            preview_image, price_adjustment, in_stock, attributes, display_order, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.id || `var-${id}-${i}`,
            id,
            v.name || `Variant ${i + 1}`,
            vType,
            v.sku || `SKU-${id}-${i}`,
            v.color_hex || null,
            v.thumbnail_image || null,
            v.preview_image || null,
            Number(v.price_adjustment) || 0,
            v.in_stock ? 1 : 0,
            typeof v.attributes === 'object' ? JSON.stringify(v.attributes) : v.attributes || null,
            i,
            v.active ?? 1,
          ]
        );
      }
    }

    // 7. Save specifications safely
    if (Array.isArray(specifications)) {
      for (let i = 0; i < specifications.length; i++) {
        const s = specifications[i];
        if (s && s.label) {
          await db.execute(
            `INSERT INTO product_specifications (id, product_id, label, value, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [s.id || `spec-${id}-${i}`, id, s.label.trim(), s.value?.trim() || '', i]
          );
        }
      }
    }

    // 8. Save customization configs safely
    const VALID_FIELD_TYPES = new Set(['dimension_pair', 'select', 'number', 'text', 'boolean']);
    if (Array.isArray(customization_configs)) {
      for (let i = 0; i < customization_configs.length; i++) {
        const cfg = customization_configs[i];
        if (!cfg || !cfg.field_key) continue;

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
          `INSERT INTO customization_configs (
            id, product_id, field_key, field_label, field_type, options, default_value,
            min_value, max_value, unit, is_required, display_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cfg.id || `cfg-${id}-${i}`,
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
            i,
          ]
        );
      }
    }

    return NextResponse.json({ success: true, id, slug: finalSlug });
  } catch (error) {
    console.error('Admin POST product error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}
