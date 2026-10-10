import fs from 'fs';
import path from 'path';
import { CATEGORIES } from '../src/lib/data/categories';
import { CURTAIN_TYPES } from '../src/lib/data/curtains';
import { BLIND_TYPES } from '../src/lib/data/blinds';
import { SOFA_FABRIC_TYPES } from '../src/lib/data/sofa-fabrics';
import { WALLPAPER_TYPES } from '../src/lib/data/wallpapers';
import { CARPET_TYPES } from '../src/lib/data/carpets';
import { PRODUCTS } from '../src/lib/data/products';
import { SERVICES } from '../src/lib/data/services';
import { getDatabase } from '../src/lib/db/index';

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

async function runSeed() {
  console.log('--- Starting Zaira Furnishing Database Migration & Seed ---');

  const db = getDatabase();

  // 1. Run Schema Migration
  const schemaPath = path.resolve(process.cwd(), 'migrations/0001_initial_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  console.log('Applying 0001_initial_schema.sql...');
  await db.runMigration(schemaSql);
  console.log('Schema migration applied successfully.');

  const sqlStatements: string[] = [
    '-- ==============================================================================',
    '-- ZAIRA FURNISHING — Migration 0002: Seed Real Initial Catalog & CMS Data',
    '-- ==============================================================================',
    'BEGIN TRANSACTION;',
  ];

  // 2. Seed Default Admin User
  console.log('Seeding initial admin user...');
  const adminSql = `INSERT OR IGNORE INTO users (id, role, name, email, phone, status) VALUES ('usr-admin-01', 'ADMIN', 'Zaira Atelier Admin', 'concierge@zairafurnishing.com', '07947415666', 'active');`;
  sqlStatements.push(adminSql);
  await db.execute(
    `INSERT OR IGNORE INTO users (id, role, name, email, phone, status) VALUES (?, ?, ?, ?, ?, ?)`,
    ['usr-admin-01', 'ADMIN', 'Zaira Atelier Admin', 'concierge@zairafurnishing.com', '07947415666', 'active']
  );

  // 3. Seed All 14 Categories
  console.log(`Seeding ${CATEGORIES.length} official categories...`);
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const catSql = `INSERT OR REPLACE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable, item_count_text) VALUES (${escapeSql(c.id)}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.tagline)}, ${escapeSql(c.description)}, ${escapeSql(c.image)}, ${i}, 1, ${c.featured ? 1 : 0}, ${c.isCustomizable ? 1 : 0}, ${escapeSql(c.itemCountText)});`;
    sqlStatements.push(catSql);
    await db.execute(
      `INSERT OR REPLACE INTO categories (id, name, slug, tagline, description, image, display_order, active, featured, is_customizable, item_count_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.slug, c.tagline, c.description, c.image, i, 1, c.featured ? 1 : 0, c.isCustomizable ? 1 : 0, c.itemCountText]
    );
  }

  // 4. Seed Genuine Subcategories
  const subcategoryGroups = [
    { catSlug: 'curtains-drapes', items: CURTAIN_TYPES },
    { catSlug: 'window-blinds-shades', items: BLIND_TYPES },
    { catSlug: 'sofa-fabrics-upholstery', items: SOFA_FABRIC_TYPES },
    { catSlug: 'wallpapers-wall-coverings', items: WALLPAPER_TYPES },
    { catSlug: 'carpets-rugs', items: CARPET_TYPES },
  ];

  let totalSubcategories = 0;
  for (const group of subcategoryGroups) {
    const parentCat = CATEGORIES.find((c) => c.slug === group.catSlug);
    if (!parentCat) continue;

    for (let j = 0; j < group.items.length; j++) {
      const item = group.items[j];
      const subId = `sub-${group.catSlug}-${item.slug}`;
      const subSql = `INSERT OR REPLACE INTO subcategories (id, category_id, name, slug, description, image, display_order, active) VALUES (${escapeSql(subId)}, ${escapeSql(parentCat.id)}, ${escapeSql(item.name)}, ${escapeSql(item.slug)}, ${escapeSql(item.description)}, ${escapeSql(item.image)}, ${j}, 1);`;
      sqlStatements.push(subSql);
      await db.execute(
        `INSERT OR REPLACE INTO subcategories (id, category_id, name, slug, description, image, display_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [subId, parentCat.id, item.name, item.slug, item.description, item.image, j, 1]
      );
      totalSubcategories++;
    }
  }
  console.log(`Seeded ${totalSubcategories} genuine subcategories.`);

  // 5. Seed 50 Products + Images + Variants + Specs
  console.log(`Seeding ${PRODUCTS.length} approved products with variants & specs...`);
  for (let k = 0; k < PRODUCTS.length; k++) {
    const p = PRODUCTS[k];

    // Find category ID
    const cat = CATEGORIES.find((c) => c.slug === p.categorySlug || c.name === p.categoryName);
    const categoryId = cat ? cat.id : 'cat-1';

    // Find subcategory ID if applicable
    const subcatSlug = p.curtainType || p.blindType || p.sofaFabricType || p.wallpaperType || p.carpetType;
    let subcategoryId: string | null = null;
    if (subcatSlug) {
      subcategoryId = `sub-${p.categorySlug}-${subcatSlug}`;
    }

    const pricingType = p.productType === 'custom_made' ? (p.startingPrice ? 'per_panel' : 'custom_estimate') : 'fixed';
    const spaceSlugsJson = JSON.stringify(p.spaceSlugs || []);

    const prodSql = `INSERT OR REPLACE INTO products (id, category_id, subcategory_id, name, display_name, slug, description, short_description, product_type, pricing_type, base_price, starting_price, unit, custom_made, featured, custom_measurement_available, active, display_order, currency, space_slugs) VALUES (${escapeSql(p.id)}, ${escapeSql(categoryId)}, ${escapeSql(subcategoryId)}, ${escapeSql(p.name)}, ${escapeSql(p.displayName || p.name)}, ${escapeSql(p.slug)}, ${escapeSql(p.description)}, ${escapeSql(p.shortDescription)}, ${escapeSql(p.productType)}, ${escapeSql(pricingType)}, ${p.price}, ${p.startingPrice ? 1 : 0}, ${escapeSql(p.startingPrice ? 'panel' : 'piece')}, ${p.productType === 'custom_made' ? 1 : 0}, ${p.featured ? 1 : 0}, ${p.customMeasurementAvailable ? 1 : 0}, 1, ${k}, ${escapeSql(p.currency || '₹')}, ${escapeSql(spaceSlugsJson)});`;
    sqlStatements.push(prodSql);

    await db.execute(
      `INSERT OR REPLACE INTO products (id, category_id, subcategory_id, name, display_name, slug, description, short_description, product_type, pricing_type, base_price, starting_price, unit, custom_made, featured, custom_measurement_available, active, display_order, currency, space_slugs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        categoryId,
        subcategoryId,
        p.name,
        p.displayName || p.name,
        p.slug,
        p.description,
        p.shortDescription,
        p.productType,
        pricingType,
        p.price,
        p.startingPrice ? 1 : 0,
        p.startingPrice ? 'panel' : 'piece',
        p.productType === 'custom_made' ? 1 : 0,
        p.featured ? 1 : 0,
        p.customMeasurementAvailable ? 1 : 0,
        1,
        k,
        p.currency || '₹',
        spaceSlugsJson,
      ]
    );

    // Product Images
    if (p.mainImage) {
      const imgId = `img-${p.id}-main`;
      const imgSql = `INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active) VALUES (${escapeSql(imgId)}, ${escapeSql(p.id)}, ${escapeSql(p.mainImage)}, ${escapeSql(p.name)}, 0, 1, 1);`;
      sqlStatements.push(imgSql);
      await db.execute(
        `INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [imgId, p.id, p.mainImage, p.name, 0, 1, 1]
      );
    }

    if (p.galleryImages && Array.isArray(p.galleryImages)) {
      for (let g = 0; g < p.galleryImages.length; g++) {
        const galImg = p.galleryImages[g];
        if (galImg !== p.mainImage) {
          const galId = `img-${p.id}-gal-${g}`;
          const galSql = `INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active) VALUES (${escapeSql(galId)}, ${escapeSql(p.id)}, ${escapeSql(galImg)}, ${escapeSql(p.name)}, ${g + 1}, 0, 1);`;
          sqlStatements.push(galSql);
          await db.execute(
            `INSERT OR REPLACE INTO product_images (id, product_id, image_url, alt_text, display_order, is_main, active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [galId, p.id, galImg, p.name, g + 1, 0, 1]
          );
        }
      }
    }

    // Product Variants (Colors & Options)
    if (p.variations && Array.isArray(p.variations)) {
      for (let v = 0; v < p.variations.length; v++) {
        const vr = p.variations[v];
        const varId = vr.id || `var-${p.id}-${v}`;
        const attrJson = JSON.stringify(vr.attributes || {});
        const varSql = `INSERT OR REPLACE INTO product_variants (id, product_id, name, variant_type, sku, color_hex, thumbnail_image, preview_image, price_adjustment, in_stock, attributes, display_order, active) VALUES (${escapeSql(varId)}, ${escapeSql(p.id)}, ${escapeSql(vr.name)}, ${escapeSql(vr.type || 'color')}, ${escapeSql(vr.sku || `${p.slug}-${v}`)}, ${escapeSql(vr.colorHex)}, ${escapeSql(vr.thumbnailImage || vr.image)}, ${escapeSql(vr.image)}, ${vr.price ? vr.price - p.price : 0}, ${vr.inStock ? 1 : 0}, ${escapeSql(attrJson)}, ${v}, 1);`;
        sqlStatements.push(varSql);
        await db.execute(
          `INSERT OR REPLACE INTO product_variants (id, product_id, name, variant_type, sku, color_hex, thumbnail_image, preview_image, price_adjustment, in_stock, attributes, display_order, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            varId,
            p.id,
            vr.name,
            vr.type || 'color',
            vr.sku || `${p.slug}-${v}`,
            vr.colorHex,
            vr.thumbnailImage || vr.image,
            vr.image,
            vr.price ? vr.price - p.price : 0,
            vr.inStock ? 1 : 0,
            attrJson,
            v,
            1,
          ]
        );
      }
    }

    // Product Specifications
    if (p.specifications && Array.isArray(p.specifications)) {
      for (let s = 0; s < p.specifications.length; s++) {
        const spec = p.specifications[s];
        const specId = `spec-${p.id}-${s}`;
        const specSql = `INSERT OR REPLACE INTO product_specifications (id, product_id, label, value, display_order) VALUES (${escapeSql(specId)}, ${escapeSql(p.id)}, ${escapeSql(spec.label)}, ${escapeSql(spec.value)}, ${s});`;
        sqlStatements.push(specSql);
        await db.execute(
          `INSERT OR REPLACE INTO product_specifications (id, product_id, label, value, display_order) VALUES (?, ?, ?, ?, ?)`,
          [specId, p.id, spec.label, spec.value, s]
        );
      }
    }

    // Customization Configurations (where product is custom made)
    if (p.productType === 'custom_made') {
      const isCurtain = p.categorySlug === 'curtains-drapes';
      const isBlind = p.categorySlug === 'window-blinds-shades';

      if (isCurtain || isBlind) {
        // Dimension configuration
        const dimId = `cust-${p.id}-dim`;
        await db.execute(
          `INSERT OR REPLACE INTO customization_configs (id, product_id, field_key, field_label, field_type, options, default_value, unit, is_required, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dimId, p.id, 'dimensions', 'Width & Drop Dimensions', 'dimension_pair', null, 'Standard Size', 'inches', 1, 0]
        );

        if (isCurtain) {
          const pleatId = `cust-${p.id}-pleat`;
          const pleatOptions = JSON.stringify(['Eyelet', 'Pinch Pleat', 'American Pleat', 'Ripple Fold', 'Goblet', 'Rod Pocket']);
          await db.execute(
            `INSERT OR REPLACE INTO customization_configs (id, product_id, field_key, field_label, field_type, options, default_value, is_required, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pleatId, p.id, 'heading_style', 'Pleat / Heading Style', 'select', pleatOptions, 'Eyelet', 1, 1]
          );
        }
      }
    }
  }

  // 6. Seed 8 Atelier Services
  console.log(`Seeding ${SERVICES.length} verified atelier services...`);
  const serviceImages: Record<string, string> = {
    'free-in-home-measurement': '/images/services/free-home-measurement.jpg',
    'doorstep-fabric-demo': '/images/services/fabric-samples-at-home.jpg',
    'custom-tailoring-and-stitching': '/images/services/custom-stitching.jpg',
    'professional-installation': '/images/services/professional-installation.jpg',
    'motorization-smart-home': '/images/services/smart-blinds-setup.jpg',
    'nri-remote-home-styling': '/images/services/remote-home-styling.jpg',
    'corporate-furnishings': '/images/services/corporate-furnishings.jpg',
    'warranty-after-sales': '/images/services/warranty-after-sales.jpg',
  };

  for (let m = 0; m < SERVICES.length; m++) {
    const s = SERVICES[m];
    const srvId = s.id || `srv-${s.slug}`;
    const highlightsJson = JSON.stringify(s.highlights || []);
    const srvImg = serviceImages[s.slug] || '/images/hero/living_room.jpg';

    const srvSql = `INSERT OR REPLACE INTO services (id, name, slug, short_desc, full_desc, image, icon_name, highlights, requires_site_visit, active, display_order) VALUES (${escapeSql(srvId)}, ${escapeSql(s.title)}, ${escapeSql(s.slug)}, ${escapeSql(s.shortDesc)}, ${escapeSql(s.fullDesc)}, ${escapeSql(srvImg)}, ${escapeSql(s.iconName)}, ${escapeSql(highlightsJson)}, ${s.requiresSiteVisit ? 1 : 0}, 1, ${m});`;
    sqlStatements.push(srvSql);
    await db.execute(
      `INSERT OR REPLACE INTO services (id, name, slug, short_desc, full_desc, image, icon_name, highlights, requires_site_visit, active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [srvId, s.title, s.slug, s.shortDesc, s.fullDesc, srvImg, s.iconName, highlightsJson, s.requiresSiteVisit ? 1 : 0, 1, m]
    );
  }

  // 7. Seed CMS Sections for Approved Homepage & Global Elements
  console.log('Seeding CMS sections...');
  const cmsBlocks = [
    {
      section_key: 'home_hero',
      title: 'Beautiful Furnishings for Your Home',
      subtitle: 'Curtains, blinds, wallpapers, rugs, flooring and more for your home.',
      content: JSON.stringify({
        eyebrow: 'ZAIRA FURNISHING',
        primary_cta_text: 'Shop Now',
        primary_cta_link: '/products',
        secondary_cta_text: 'Book a Free Visit',
        secondary_cta_link: '/services',
      }),
      image_url: '/images/hero/living_room.jpg',
    },
    {
      section_key: 'home_featured_furnishings',
      title: 'Featured Furnishings',
      subtitle: 'Explore selected furnishings from Zaira.',
      content: JSON.stringify({
        featured_slugs: [
          'blackout-curtains',
          'roma-textured-boucle-upholstery',
          'roller-blinds',
          'solis-hand-tufted-wool-silk-rug',
          'monaco-crush-resistant-matte-velvet',
        ],
      }),
    },
    {
      section_key: 'home_brand_story',
      title: 'About Zaira Furnishing',
      subtitle: 'Furnishings & Services',
      content: JSON.stringify({
        paragraph1: 'Zaira Furnishing offers a wide range of furnishings and home decor for different spaces in your home.',
        paragraph2: 'From curtains, blinds and sofa fabrics to wallpapers, rugs, flooring, mattresses, bed linen, cushions, dining products and home decor, we help you find furnishings that suit your space.',
        paragraph3: 'Our services include home measurement, fabric and sample visits, custom stitching, professional installation, smart-home setup, remote home styling, commercial furnishing and after-sales support.',
        cta_text: 'Learn More',
        cta_link: '/about',
      }),
      image_url: '/images/about/about-main-living.jpg',
      secondary_image_url: '/images/about/about-tv-unit.jpg',
    },
    {
      section_key: 'home_showroom_contact',
      title: 'Visit the Zaira Showroom',
      subtitle: 'See fabrics, furnishings and finishes in person, and discuss your requirements with our team.',
      content: JSON.stringify({
        eyebrow: 'VISIT THE SHOWROOM',
        address: 'Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089',
        phone: '07947415666',
        email: 'concierge@zairafurnishing.com',
        hours: 'Mon–Sat 10:30 AM–8:30 PM · Sunday by appointment',
        maps_query: 'https://www.google.com/maps/search/?api=1&query=Zaira+Furnishing,+Rd+Number+5,+Kyetian+Goud+Nilayam,+Alkapur+Twp,+Puppalguda,+Hyderabad,+Telangana+500089',
      }),
      image_url: '/images/hero/living_room.jpg',
    },
    {
      section_key: 'site_footer',
      title: 'Zaira Furnishing',
      subtitle: 'Curtains, blinds, fabrics and furnishings for thoughtfully designed spaces.',
      content: JSON.stringify({
        copyright: '© 2026 Zaira Furnishing. All rights reserved.',
        address: 'Rd Number 5, Kyetian Goud Nilayam, Alkapur Twp, Puppalguda, Hyderabad, Telangana 500089',
        phone: '07947415666',
        email: 'concierge@zairafurnishing.com',
        hours: 'Mon–Sat 10:30 AM–8:30 PM\nSunday by appointment',
      }),
    },
  ];

  for (const block of cmsBlocks) {
    const cmsSql = `INSERT OR REPLACE INTO cms_content (id, section_key, title, subtitle, content, image_url, secondary_image_url) VALUES (${escapeSql(`cms-${block.section_key}`)}, ${escapeSql(block.section_key)}, ${escapeSql(block.title)}, ${escapeSql(block.subtitle)}, ${escapeSql(block.content)}, ${escapeSql(block.image_url)}, ${escapeSql(block.secondary_image_url)});`;
    sqlStatements.push(cmsSql);
    await db.execute(
      `INSERT OR REPLACE INTO cms_content (id, section_key, title, subtitle, content, image_url, secondary_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`cms-${block.section_key}`, block.section_key, block.title, block.subtitle, block.content, block.image_url, block.secondary_image_url]
    );
  }

  sqlStatements.push('COMMIT;');

  // Write static migration file
  const seedMigrationPath = path.resolve(process.cwd(), 'migrations/0002_seed_initial_data.sql');
  fs.writeFileSync(seedMigrationPath, sqlStatements.join('\n'), 'utf8');
  console.log(`Generated migration file: migrations/0002_seed_initial_data.sql (${sqlStatements.length} lines)`);

  console.log('--- Migration & Seed Completed Successfully! ---');
}

runSeed().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
