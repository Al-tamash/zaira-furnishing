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
  attributes: z.record(z.string(), z.unknown()).default({}),
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
  pricingType: z.string().default('fixed'),
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

export type ProductImageInput = z.input<typeof ProductImageInputSchema>;
export type ProductVariantInput = z.input<typeof ProductVariantInputSchema>;
export type ProductSpecificationInput = z.input<typeof ProductSpecificationInputSchema>;
export type CustomizationConfigInput = z.input<typeof CustomizationConfigInputSchema>;
export type CreateProductInput = z.input<typeof CreateProductInputSchema>;
export type ValidatedProductInput = z.output<typeof CreateProductInputSchema>;
export type UpdateProductInput = z.input<typeof UpdateProductInputSchema>;
export type DeleteProductOptions = z.input<typeof DeleteProductOptionsSchema>;

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
