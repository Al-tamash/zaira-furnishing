import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const db = new DatabaseSync('data/zaira.db');

console.log('=== DATA QUALITY AUDIT FOR CURTAINS CATALOG ===\n');

let issues = [];

// 1. Check duplicate product slugs & IDs in entire products table
const duplicateSlugs = db.prepare("SELECT slug, COUNT(*) as c FROM products GROUP BY slug HAVING c > 1").all();
if (duplicateSlugs.length > 0) {
  issues.push(`Duplicate product slugs found: ${JSON.stringify(duplicateSlugs)}`);
} else {
  console.log('✓ Zero duplicate product slugs across catalog');
}

const duplicateIds = db.prepare("SELECT id, COUNT(*) as c FROM products GROUP BY id HAVING c > 1").all();
if (duplicateIds.length > 0) {
  issues.push(`Duplicate product IDs found: ${JSON.stringify(duplicateIds)}`);
} else {
  console.log('✓ Zero duplicate product IDs across catalog');
}

// 2. Check curtain products specifically
const curtainProducts = db.prepare(`
  SELECT p.*, s.slug as sub_slug
  FROM products p
  LEFT JOIN subcategories s ON p.subcategory_id = s.id
  WHERE p.category_id = 'cat-1'
`).all();

console.log(`\nAuditing ${curtainProducts.length} curtain products...`);

for (const p of curtainProducts) {
  // Check category
  if (p.category_id !== 'cat-1') {
    issues.push(`Product ${p.id} has invalid category_id: ${p.category_id}`);
  }
  // Check subcategory (skip inactive stage2 test if any)
  if (!p.subcategory_id && p.active === 1) {
    issues.push(`Active product ${p.id} has missing subcategory_id`);
  }
  // Check price
  if (!p.base_price || p.base_price <= 0) {
    issues.push(`Product ${p.id} has invalid base_price: ${p.base_price}`);
  }
  // Check name & description
  if (!p.name || p.name.trim() === '') {
    issues.push(`Product ${p.id} has empty name`);
  }
  if (!p.description || p.description.trim() === '') {
    if (p.active === 1) issues.push(`Active product ${p.id} has empty description`);
  }

  // Check images
  const images = db.prepare("SELECT * FROM product_images WHERE product_id = ?").all(p.id);
  if (p.active === 1 && images.length === 0) {
    issues.push(`Active product ${p.id} has no images in product_images`);
  }
  for (const img of images) {
    const fullPath = path.join(process.cwd(), 'public', img.image_url.replace(/^\//, ''));
    if (!fs.existsSync(fullPath)) {
      issues.push(`Product ${p.id} has broken image URL: ${img.image_url} (file not found: ${fullPath})`);
    }
  }

  // Check variants
  const variants = db.prepare("SELECT * FROM product_variants WHERE product_id = ?").all(p.id);
  if (p.active === 1 && variants.length === 0) {
    issues.push(`Active product ${p.id} has no variants in product_variants`);
  }
  for (const v of variants) {
    if (v.thumbnail_image) {
      const fullPath = path.join(process.cwd(), 'public', v.thumbnail_image.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        issues.push(`Variant ${v.id} of ${p.id} has broken thumbnail_image URL: ${v.thumbnail_image}`);
      }
    }
    if (v.preview_image) {
      const fullPath = path.join(process.cwd(), 'public', v.preview_image.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        issues.push(`Variant ${v.id} of ${p.id} has broken preview_image URL: ${v.preview_image}`);
      }
    }
  }

  // Check specifications
  const specs = db.prepare("SELECT * FROM product_specifications WHERE product_id = ?").all(p.id);
  if (p.active === 1 && specs.length < 3) {
    issues.push(`Active product ${p.id} has insufficient specifications (count: ${specs.length})`);
  }
}

if (issues.length === 0) {
  console.log('\n✓ ALL DATA QUALITY CHECKS PASSED WITH 0 ISSUES!');
} else {
  console.error('\nIssues found during data quality audit:');
  for (const issue of issues) {
    console.error('  - ' + issue);
  }
}

db.close();
