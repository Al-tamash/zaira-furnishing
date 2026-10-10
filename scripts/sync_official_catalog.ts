import { getDatabase } from '../src/lib/db';
import { OFFICIAL_CATALOG } from '../src/lib/data/officialCatalog';

async function syncOfficialCatalog() {
  console.log('================================================================');
  console.log('       SYNCING OFFICIAL ZAIRA FURNISHING CATALOG DATA           ');
  console.log('================================================================\n');

  const db = getDatabase();
  await db.execute('PRAGMA foreign_keys = OFF;');

  // 1. Remove unwanted extra categories that user said not to include
  console.log('1. Deactivating/Cleaning unrequested legacy categories...');
  const disallowedCategoryIds = ['cat-8', 'cat-11', 'cat-12', 'cat-13', 'cat-14'];
  for (const catId of disallowedCategoryIds) {
    await db.execute('DELETE FROM product_specifications WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [catId]);
    await db.execute('DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [catId]);
    await db.execute('DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [catId]);
    await db.execute('DELETE FROM products WHERE category_id = ?', [catId]);
    await db.execute('DELETE FROM subcategories WHERE category_id = ?', [catId]);
    await db.execute('DELETE FROM categories WHERE id = ?', [catId]);
  }

  // Remove any test products, subcategories, or categories
  await db.execute("DELETE FROM products WHERE id LIKE '%test%'");
  await db.execute("DELETE FROM subcategories WHERE id LIKE '%test%'");
  await db.execute("DELETE FROM categories WHERE id LIKE '%test%'");

  // 2. Ensure official categories exist and are active
  console.log('2. Syncing Official Categories...');
  for (let i = 0; i < OFFICIAL_CATALOG.length; i++) {
    const cat = OFFICIAL_CATALOG[i];
    await db.execute(
      `INSERT INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable, item_count_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 1, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         slug = excluded.slug,
         tagline = excluded.tagline,
         description = excluded.description,
         image = excluded.image,
         display_order = excluded.display_order,
         active = 1,
         featured = 1,
         item_count_text = excluded.item_count_text`,
      [
        cat.id,
        cat.name,
        cat.slug,
        cat.subtitle,
        cat.description,
        cat.heroImage,
        i,
        `${cat.products.length} Items`,
      ]
    );

    // Clear existing products for this category to ensure only official catalog products exist
    await db.execute('DELETE FROM product_specifications WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [cat.id]);
    await db.execute('DELETE FROM product_variants WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [cat.id]);
    await db.execute('DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE category_id = ?)', [cat.id]);
    await db.execute('DELETE FROM products WHERE category_id = ?', [cat.id]);

    // 3. Sync each product under this category
    let pricingType = 'fixed';
    if (cat.slug === 'curtains-drapes') pricingType = 'per_panel';
    else if (cat.slug === 'sofa-fabrics-upholstery') pricingType = 'per_metre';
    else if (cat.slug === 'window-blinds-shades') pricingType = 'per_sqft';
    else if (cat.slug === 'wallpapers-wall-coverings') pricingType = 'per_roll';
    else if (cat.slug === 'wooden-flooring-sports-floor' || cat.slug === 'carpets-rugs') pricingType = 'per_sqft';

    const SUBCATEGORY_MAP: Record<string, string> = {
      // Curtains
      'blackout-curtains': 'sub-curtains-drapes-blackout',
      'sheer-day-curtains': 'sub-curtains-drapes-sheer',
      'velvet-curtains': 'sub-curtains-drapes-velvet',
      'satin-plain-curtains': 'sub-curtains-drapes-satin',
      'jacquard-curtains': 'sub-curtains-drapes-jacquard',
      'linen-textured-curtains': 'sub-curtains-drapes-linen',
      'digitally-printed-curtains': 'sub-curtains-drapes-printed',
      'embroidered-curtains': 'sub-curtains-drapes-embroidered',
      'kids-room-curtains': 'sub-curtains-drapes-kids',
      'customized-made-to-measure-curtains': 'sub-curtains-drapes-custom',

      // Blinds
      'roller-blinds': 'sub-window-blinds-shades-roller',
      'zebra-blinds-day-night': 'sub-window-blinds-shades-zebra',
      'roman-blinds-shades': 'sub-window-blinds-shades-roman',
      'wooden-blinds': 'sub-window-blinds-shades-wooden',
      'venetian-blinds': 'sub-window-blinds-shades-venetian',
      'vertical-blinds': 'sub-window-blinds-shades-vertical',
      'honeycomb-cellular-shades': 'sub-window-blinds-shades-cellular',
      'balcony-monsoon-pvc-blinds': 'sub-window-blinds-shades-balcony-pvc',
      'motorized-smart-blinds': 'sub-window-blinds-shades-motorized-smart',

      // Sofa Fabrics
      'velvet-fabric': 'sub-sofa-fabrics-upholstery-velvet-chenille',
      'chenille-fabric': 'sub-sofa-fabrics-upholstery-velvet-chenille',
      'cotton-cotton-blends': 'sub-sofa-fabrics-upholstery-linen-cotton',
      'linen-textured-blends': 'sub-sofa-fabrics-upholstery-linen-cotton',
      'suede-microfiber': 'sub-sofa-fabrics-upholstery-textured-weave',
      'artificial-leatherette-faux-leather': 'sub-sofa-fabrics-upholstery-leatherette',
      'pure-genuine-leather': 'sub-sofa-fabrics-upholstery-leatherette',
      'stain-resistant-pet-friendly-fabrics': 'sub-sofa-fabrics-upholstery-performance',
      'sofa-recliner-covers': 'sub-sofa-fabrics-upholstery-boucle',

      // Wallpapers
      'botanical-floral-wallpapers': 'sub-wallpapers-wall-coverings-botanical-floral',
      'textured-grasscloth-wallpapers': 'sub-wallpapers-wall-coverings-textured-grasscloth',
      'custom-panoramic-murals': 'sub-wallpapers-wall-coverings-panoramic-murals',
      'natural-silk-organic-panels': 'sub-wallpapers-wall-coverings-silk-organic',
      'metallic-leaf-foil-finishes': 'sub-wallpapers-wall-coverings-metallic-foil',

      // Carpets & Rugs
      'modern-contemporary-abstract-rugs': 'sub-carpets-rugs-hand-tufted',
      'hand-tufted-hand-knotted-rugs': 'sub-carpets-rugs-hand-knotted',
      'traditional-kilim-dhurrie-flatweaves': 'sub-carpets-rugs-flatweave',
      'antique-vintage-distressed-rugs': 'sub-carpets-rugs-silk-blend',
      'shag-high-pile-fluffy-rugs': 'sub-carpets-rugs-hand-tufted',
      'bedside-hallway-runners': 'sub-carpets-rugs-flatweave',
      'wall-to-wall-carpeting': 'sub-carpets-rugs-wall-to-wall',
    };

    for (let pIdx = 0; pIdx < cat.products.length; pIdx++) {
      const prod = cat.products[pIdx];
      const prodId = `prod-off-${prod.slug}`;
      const subcatId = SUBCATEGORY_MAP[prod.slug] || null;

      await db.execute(
        `INSERT INTO products (
          id, category_id, subcategory_id, name, display_name, slug,
          description, short_description, product_type, pricing_type,
          base_price, starting_price, unit, custom_made, featured,
          custom_measurement_available, active, display_order, currency, space_slugs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'custom_made', ?, ?, ?, 'item', 1, 1, 1, 1, ?, '₹', '["living-room","bedroom"]')
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          display_name = excluded.display_name,
          slug = excluded.slug,
          subcategory_id = excluded.subcategory_id,
          description = excluded.description,
          short_description = excluded.short_description,
          pricing_type = excluded.pricing_type,
          base_price = excluded.base_price,
          starting_price = excluded.starting_price,
          display_order = excluded.display_order,
          active = 1,
          featured = 1`,
        [
          prodId,
          cat.id,
          subcatId,
          prod.name,
          prod.name,
          prod.slug,
          `${prod.description} — ${prod.varietiesNotes}`,
          prod.description,
          pricingType,
          prod.price,
          prod.startingPrice ? 1 : 0,
          pIdx,
        ]
      );

      // Product Image
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [prodId]);
      await db.execute(
        `INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active)
         VALUES (?, ?, ?, ?, 0, 1, 1)`,
        [`img-${prodId}-main`, prodId, prod.image, prod.name]
      );

      // Product Variants (Swatches)
      await db.execute('DELETE FROM product_variants WHERE product_id = ?', [prodId]);
      for (let sIdx = 0; sIdx < prod.swatches.length; sIdx++) {
        const sw = prod.swatches[sIdx];
        await db.execute(
          `INSERT INTO product_variants (
            id, product_id, name, variant_type, sku, color_hex,
            thumbnail_image, preview_image, price_adjustment, in_stock, attributes, display_order, active
          ) VALUES (?, ?, ?, 'color', ?, ?, ?, ?, 0, 1, ?, ?, 1)`,
          [
            `var-${prodId}-${sIdx}`,
            prodId,
            sw.name,
            `ZA-${prod.slug.slice(0, 4).toUpperCase()}-${sIdx + 1}`,
            sw.hex,
            prod.image,
            prod.image,
            JSON.stringify({ Finish: sw.name, Varieties: prod.varietiesNotes }),
            sIdx,
          ]
        );
      }

      // Product Specifications
      await db.execute('DELETE FROM product_specifications WHERE product_id = ?', [prodId]);
      for (let spIdx = 0; spIdx < prod.specifications.length; spIdx++) {
        const spec = prod.specifications[spIdx];
        await db.execute(
          `INSERT INTO product_specifications (id, product_id, label, value, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [`spec-${prodId}-${spIdx}`, prodId, spec.label, spec.value, spIdx]
        );
      }
    }
  }

  await db.execute('PRAGMA foreign_keys = ON;');

  const finalCount = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM products WHERE active = 1');
  const catCount = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM categories WHERE active = 1');
  console.log(`\n✅ OFFICIAL CATALOG SYNC COMPLETE!`);
  console.log(`- Active Official Categories: ${catCount?.c}`);
  console.log(`- Active Official Products: ${finalCount?.c}\n`);
}

syncOfficialCatalog().catch(console.error);
