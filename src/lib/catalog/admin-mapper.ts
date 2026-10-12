import {
  CreateProductInput,
  CreateProductInputSchema,
  ValidatedProductInput,
  UpdateProductInput,
  UpdateProductInputSchema,
  ProductImageInput,
  ProductVariantInput,
  ProductSpecificationInput,
  CustomizationConfigInput,
} from './admin-types';

export function normalizeCreateProductPayload(raw: any): ValidatedProductInput {
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
