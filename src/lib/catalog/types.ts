import {
  ProductType,
  ProductVariation,
  ProductSpecification,
  ProductImage,
} from '@/lib/data/types';

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featured: boolean;
  isCustomizable: boolean;
  itemCountText: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  shortDescription: string;
  description: string;
  productType: ProductType;
  price: number;
  startingPrice?: boolean;
  unit?: string;
  currency?: string;
  image: string;
  mainImage: string;
  galleryImages: string[];
  images: ProductImage[];
  variations: ProductVariation[];
  specifications: ProductSpecification[];
  spaceSlugs: string[];
  featured: boolean;
  customMeasurementAvailable: boolean;
  active: boolean;
  displayOrder: number;
  // Backward compatibility getters
  curtainType?: string;
  blindType?: string;
  sofaFabricType?: string;
  wallpaperType?: string;
  carpetType?: string;
}

export interface ProductFilter {
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
  search?: string;
  limit?: number;
  activeOnly?: boolean;
}

export interface CategoryFilter {
  featured?: boolean;
  activeOnly?: boolean;
}

export interface CatalogService {
  getProduct(slugOrId: string): Promise<Product | null>;
  listProducts(filter?: ProductFilter): Promise<Product[]>;
  getCategory(slugOrId: string): Promise<Category | null>;
  listCategories(filter?: CategoryFilter): Promise<Category[]>;
  getSubcategory(categorySlugOrId: string, subcategorySlug: string): Promise<Subcategory | null>;
  listSubcategories(categorySlugOrId?: string): Promise<Subcategory[]>;
}
