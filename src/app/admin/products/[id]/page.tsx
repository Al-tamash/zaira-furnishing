'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  Plus,
  Trash2,
  Check,
  Star,
  ExternalLink,
  Sparkles,
  Layers,
  Settings,
  RotateCcw,
} from 'lucide-react';
import {
  DbProduct,
  DbCategory,
  DbSubcategory,
  DbProductImage,
  DbProductVariant,
  DbProductSpecification,
  DbCustomizationConfig,
} from '@/lib/db/types';

interface FullProductData extends DbProduct {
  images: DbProductImage[];
  variants: DbProductVariant[];
  specifications: DbProductSpecification[];
  customization_configs: DbCustomizationConfig[];
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === 'new';

  const [product, setProduct] = useState<Partial<FullProductData>>({
    name: '',
    display_name: '',
    slug: '',
    category_id: '',
    subcategory_id: null,
    description: '',
    short_description: '',
    product_type: 'standard',
    pricing_type: 'fixed',
    base_price: 1000,
    starting_price: 0,
    unit: 'piece',
    custom_made: 0,
    featured: 0,
    custom_measurement_available: 0,
    active: 1,
    display_order: 0,
    currency: '₹',
    images: [],
    variants: [],
    specifications: [],
    customization_configs: [],
  });

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DbSubcategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVariantImage, setUploadingVariantImage] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'variants' | 'specs' | 'customization'>('details');
  const [removedImages, setRemovedImages] = useState<DbProductImage[]>([]);

  useEffect(() => {
    // Load categories
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data || []);
        if (isNew && data.data?.length > 0) {
          setProduct((prev) => ({ ...prev, category_id: data.data[0].id }));
        }
      });

    // If editing existing product, fetch from API
    if (!isNew) {
      fetch(`/api/admin/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setProduct(data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // Load subcategories when category changes
  useEffect(() => {
    if (product.category_id) {
      fetch(`/api/admin/subcategories?categoryId=${product.category_id}`)
        .then((res) => res.json())
        .then((data) => setSubcategories(data.data || []));
    } else {
      setSubcategories([]);
    }
  }, [product.category_id]);

  // Image Upload via R2
  const handleUploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'products');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const isFirst = (product.images || []).length === 0;
      const newImg: DbProductImage = {
        id: `img-${Date.now()}`,
        product_id: product.id || '',
        image_url: data.url,
        alt_text: product.name || 'Product Image',
        display_order: (product.images || []).length,
        is_main: isFirst ? 1 : 0,
        active: 1,
        created_at: new Date().toISOString(),
      };

      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImg],
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetMainImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: (prev.images || []).map((img, i) => ({
        ...img,
        is_main: i === index ? 1 : 0,
      })),
    }));
  };

  const handleRemoveImage = (index: number) => {
    setProduct((prev) => {
      const target = (prev.images || [])[index];
      if (target) {
        setRemovedImages((prevRemoved) => [target, ...prevRemoved]);
      }
      const filtered = (prev.images || []).filter((_, i) => i !== index);
      // Ensure at least one is main if available
      if (filtered.length > 0 && !filtered.some((img) => img.is_main === 1)) {
        filtered[0].is_main = 1;
      }
      return { ...prev, images: filtered };
    });
  };

  const handleRestoreImage = (imageToRestore: DbProductImage) => {
    setProduct((prev) => {
      const current = prev.images || [];
      return {
        ...prev,
        images: [...current, { ...imageToRestore, is_main: current.length === 0 ? 1 : 0 }],
      };
    });
    setRemovedImages((prev) => prev.filter((img) => img.image_url !== imageToRestore.image_url));
  };

  const handleRestoreAllImages = () => {
    setProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...removedImages],
    }));
    setRemovedImages([]);
  };

  // Variant operations
  const handleAddVariant = () => {
    const newVar: DbProductVariant = {
      id: `var-${Date.now()}`,
      product_id: product.id || '',
      name: 'New Color/Finish',
      variant_type: 'color',
      sku: `${product.slug || 'item'}-${(product.variants || []).length + 1}`,
      color_hex: '#D6D3D1',
      price_adjustment: 0,
      in_stock: 1,
      attributes: '{}',
      display_order: (product.variants || []).length,
      active: 1,
      created_at: new Date().toISOString(),
    };
    setProduct((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVar],
    }));
  };

  const handleRemoveVariant = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  // Upload variant thumbnail or preview image
  const handleUploadVariantImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    field: 'thumbnail_image' | 'preview_image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVariantImage(idx);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'products');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      const updated = [...(product.variants || [])];
      updated[idx] = { ...updated[idx], [field]: data.url };
      setProduct((prev) => ({ ...prev, variants: updated }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingVariantImage(null);
    }
  };

  // Specification operations
  const handleAddSpec = () => {
    const newSpec: DbProductSpecification = {
      id: `spec-${Date.now()}`,
      product_id: product.id || '',
      label: 'Specification Label',
      value: 'Specification Value',
      display_order: (product.specifications || []).length,
    };
    setProduct((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), newSpec],
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: (prev.specifications || []).filter((_, i) => i !== index),
    }));
  };

// Helper to format stored JSON options into clean comma-separated text for input field
const formatOptionsForInput = (raw: string | null | undefined): string => {
  if (!raw) return '';
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {
      // Ignore parse error and fallback to raw
    }
  }
  return raw;
};

// Customization rules operations
  const handleAddCustomConfig = () => {
    const newCfg: DbCustomizationConfig = {
      id: `cfg-${Date.now()}`,
      product_id: product.id || '',
      field_key: 'custom_option',
      field_label: 'Custom Option',
      field_type: 'select',
      options: 'Option 1, Option 2',
      default_value: 'Option 1',
      unit: null,
      is_required: 1,
      display_order: (product.customization_configs || []).length,
    };
    setProduct((prev) => ({
      ...prev,
      customization_configs: [...(prev.customization_configs || []), newCfg],
    }));
  };

  const handleRemoveCustomConfig = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      customization_configs: (prev.customization_configs || []).filter((_, i) => i !== index),
    }));
  };

  // Save product
  const handleSaveProduct = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!product.name || !product.slug || !product.category_id) {
      alert('Please fill in product name, slug, and category');
      return;
    }

    setSaving(true);
    try {
      const endpoint = isNew ? '/api/admin/products' : `/api/admin/products/${product.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const mainImg = product.images?.find((img) => img.is_main === 1)?.image_url || product.images?.[0]?.image_url;

      const payload = {
        ...product,
        main_image: mainImg,
        gallery_images: product.images?.map((img) => img.image_url),
        customization_configs: (product.customization_configs || []).map((cfg) => {
          let opts = cfg.options;
          if (opts && typeof opts === 'string') {
            const trimmed = opts.trim();
            if (trimmed.startsWith('[')) {
              try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                  opts = JSON.stringify(parsed);
                } else {
                  opts = JSON.stringify(trimmed.split(',').map((s) => s.trim()).filter(Boolean));
                }
              } catch {
                opts = JSON.stringify(trimmed.split(',').map((s) => s.trim()).filter(Boolean));
              }
            } else {
              opts = JSON.stringify(trimmed.split(',').map((s) => s.trim()).filter(Boolean));
            }
          }
          return { ...cfg, options: opts };
        }),
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      alert('Product saved successfully to Cloudflare D1!');
      router.push('/admin/products');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#78716C]">
        <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[13px]">Loading product data from Cloudflare D1...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ─── Breadcrumb & Save Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-[#EDE8DE] text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block">
              {isNew ? 'New Catalog Item' : `Edit: ${product.name}`}
            </span>
            <h1 className="font-serif text-[20px] sm:text-[24px] text-[#1C1917] font-medium truncate max-w-lg">
              {product.name || 'Untitled Product'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isNew && product.slug && (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[#1C1917] text-[12px] font-medium hover:border-[#1C1917]"
            >
              <span>View Live</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#9A7B56]" />
            </Link>
          )}

          <button
            onClick={handleSaveProduct}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving to D1...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex items-center gap-2 border-b border-[#EDE8DE] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'details'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'details' ? 'bg-white text-[#2C221E]' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            1
          </span>
          <span>General Details</span>
        </button>

        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'images'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'images' ? 'bg-white text-[#2C221E]' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            2
          </span>
          <span>Product Images ({product.images?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('variants')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'variants'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'variants' ? 'bg-white text-[#2C221E]' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            3
          </span>
          <span>Variants & Colors ({product.variants?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'specs'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'specs' ? 'bg-white text-[#2C221E]' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            4
          </span>
          <span>Specifications ({product.specifications?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('customization')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'customization'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            activeTab === 'customization' ? 'bg-white text-[#2C221E]' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            5
          </span>
          <span>Customization Rules ({product.customization_configs?.length || 0})</span>
        </button>
      </div>

      {/* ─── TAB 1: General Details ─── */}
      {activeTab === 'details' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Product Title / Name
              </label>
              <input
                type="text"
                value={product.name || ''}
                onChange={(e) => {
                  const newName = e.target.value;
                  if (isNew) {
                    const autoSlug = newName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/^-+|-+$/g, '');
                    setProduct((prev) => {
                      const oldAutoSlug = (prev.name || '')
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      const shouldUpdateSlug = !prev.slug || prev.slug === oldAutoSlug;
                      return {
                        ...prev,
                        name: newName,
                        display_name: prev.display_name === prev.name || !prev.display_name ? newName : prev.display_name,
                        slug: shouldUpdateSlug ? autoSlug : prev.slug,
                      };
                    });
                  } else {
                    setProduct({ ...product, name: newName });
                  }
                }}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Display Name (Short)
              </label>
              <input
                type="text"
                value={product.display_name || ''}
                onChange={(e) => setProduct({ ...product, display_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={product.slug || ''}
                onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] font-mono focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Category
              </label>
              <select
                value={product.category_id || ''}
                onChange={(e) => setProduct({ ...product, category_id: e.target.value, subcategory_id: null })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] bg-white focus:outline-hidden focus:border-[#9A7B56]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                  Subcategory Type
                </label>
                <select
                  value={product.subcategory_id || ''}
                  onChange={(e) => setProduct({ ...product, subcategory_id: e.target.value || null })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] bg-white focus:outline-hidden focus:border-[#9A7B56]"
                >
                  <option value="">None (Top-Level Category Only)</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Product Type
              </label>
              <select
                value={product.product_type || 'standard'}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    product_type: e.target.value as 'standard' | 'custom_made',
                    custom_made: e.target.value === 'custom_made' ? 1 : 0,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] bg-white focus:outline-hidden focus:border-[#9A7B56]"
              >
                <option value="standard">Standard E-Commerce (Add to Cart directly)</option>
                <option value="custom_made">Custom Made / Atelier (Enquire / Custom Dimensions)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Base Price (₹)
              </label>
              <input
                type="number"
                value={product.base_price ?? 0}
                onChange={(e) => setProduct({ ...product, base_price: Number(e.target.value) })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
                Unit Label
              </label>
              <input
                type="text"
                placeholder="piece, panel, metre, roll, sqft..."
                value={product.unit || ''}
                onChange={(e) => setProduct({ ...product, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] cursor-pointer text-[12.5px]">
              <input
                type="checkbox"
                checked={product.starting_price === 1}
                onChange={(e) => setProduct({ ...product, starting_price: e.target.checked ? 1 : 0 })}
                className="rounded text-[#2C221E]"
              />
              <span>Display as &quot;From ₹...&quot;</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] cursor-pointer text-[12.5px]">
              <input
                type="checkbox"
                checked={product.featured === 1}
                onChange={(e) => setProduct({ ...product, featured: e.target.checked ? 1 : 0 })}
                className="rounded text-[#2C221E]"
              />
              <span>Homepage Featured</span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] cursor-pointer text-[12.5px]">
              <input
                type="checkbox"
                checked={product.active === 1}
                onChange={(e) => setProduct({ ...product, active: e.target.checked ? 1 : 0 })}
                className="rounded text-[#2C221E]"
              />
              <span>Active Status</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
              Short Description (Card Summary)
            </label>
            <input
              type="text"
              value={product.short_description || ''}
              onChange={(e) => setProduct({ ...product, short_description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5">
              Full Product Description
            </label>
            <textarea
              rows={4}
              value={product.description || ''}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
            />
          </div>

          {/* ─── Tab 1 Footer: General Details -> Product Images ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE8DE] mt-6">
            <span className="text-[12px] font-medium text-[#78716C]">
              Step 1 of 5: General Details
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
              >
                <Save className="w-4 h-4 text-[#9A7B56]" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!product.name?.trim()) {
                    alert('Please enter a product title / name before proceeding.');
                    return;
                  }
                  setActiveTab('images');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: Product Images</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Images & R2 Upload ─── */}
      {activeTab === 'images' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE8DE]">
            <div>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">Product Photography</h2>
              <p className="text-[12.5px] text-[#78716C]">
                Upload high-resolution images to Cloudflare R2. First image marked as &quot;Main&quot; is used on catalog cards.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer shrink-0">
              <Upload className="w-4 h-4" />
              <span>{uploadingImage ? 'Uploading to R2...' : 'Upload Image to R2'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadProductImage}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(product.images || []).map((img, idx) => (
              <div
                key={img.id || idx}
                className={`relative rounded-2xl border overflow-hidden bg-[#FAF7F2] p-2 flex flex-col justify-between ${
                  img.is_main === 1 ? 'border-[#2C221E] ring-2 ring-[#2C221E]' : 'border-[#EDE8DE]'
                }`}
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden relative bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.alt_text || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                  {img.is_main === 1 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#2C221E] text-white text-[9.5px] font-bold uppercase tracking-wider shadow-xs">
                      Main
                    </span>
                  )}
                </div>

                <div className="pt-2 space-y-1.5">
                  <input
                    type="text"
                    placeholder="Alt text (SEO description)"
                    value={img.alt_text || ''}
                    onChange={(e) => {
                      const updated = [...(product.images || [])];
                      updated[idx] = { ...updated[idx], alt_text: e.target.value };
                      setProduct((prev) => ({ ...prev, images: updated }));
                    }}
                    className="w-full px-2 py-1 rounded-lg border border-[#D5CDBF] text-[11px] bg-white placeholder:text-[#A8A29E]"
                  />
                  <div className="flex items-center justify-between text-[11.5px]">
                    {img.is_main !== 1 ? (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(idx)}
                        className="text-[#2C221E] hover:underline font-medium cursor-pointer"
                      >
                        Set Main
                      </button>
                    ) : (
                      <span className="text-[#9A7B56] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Recently Removed Images / Restore Bar ─── */}
          {removedImages.length > 0 && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  <span>Recently Removed Images ({removedImages.length})</span>
                  <span className="text-xs font-normal text-amber-800 hidden sm:inline">— Accidental deletion? You can restore them below before saving.</span>
                </div>
                <button
                  type="button"
                  onClick={handleRestoreAllImages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer w-fit"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore All Images</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-1">
                {removedImages.map((img, idx) => (
                  <div
                    key={`removed-${idx}-${img.image_url}`}
                    className="relative group rounded-xl overflow-hidden border border-amber-300 bg-white shadow-xs p-1.5 flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-stone-100 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt={img.alt_text || 'Removed product image'}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="pt-2 pb-0.5">
                      <button
                        type="button"
                        onClick={() => handleRestoreImage(img)}
                        className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-[#1C1714] text-white text-[11px] font-medium transition-colors cursor-pointer"
                        title="Restore this image to the gallery"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Tab 2 Footer: Product Images -> Variants & Colors ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE8DE] mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('details');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: General Details</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
              >
                <Save className="w-4 h-4 text-[#9A7B56]" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('variants');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: Variants & Colors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Variants & Colors ─── */}
      {activeTab === 'variants' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DE]">
            <div>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">Color & Material Variations</h2>
              <p className="text-[12.5px] text-[#78716C]">
                Variants rendered on the product detail page with custom color swatches and SKUs.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5CDBF] text-[12.5px] font-semibold text-[#1C1917] hover:border-[#1C1917] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-4">
            {(product.variants || []).map((v, idx) => (
              <div
                key={v.id || idx}
                className="p-4 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2]/50 space-y-3"
              >
                {/* Row 1: Color + Name + SKU + Price + Stock + Delete */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Color Hex & Name */}
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <input
                      type="color"
                      value={v.color_hex || '#D6D3D1'}
                      onChange={(e) => {
                        const updated = [...(product.variants || [])];
                        updated[idx].color_hex = e.target.value;
                        setProduct({ ...product, variants: updated });
                      }}
                      className="w-8 h-8 rounded-lg border border-black/10 cursor-pointer shrink-0"
                      title="Color swatch"
                    />
                    <input
                      type="text"
                      placeholder="Variant Name (e.g. Ivory White)"
                      value={v.name || ''}
                      onChange={(e) => {
                        const updated = [...(product.variants || [])];
                        updated[idx].name = e.target.value;
                        setProduct({ ...product, variants: updated });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[13px] bg-white"
                    />
                  </div>

                  {/* SKU */}
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="SKU Code"
                      value={v.sku || ''}
                      onChange={(e) => {
                        const updated = [...(product.variants || [])];
                        updated[idx].sku = e.target.value;
                        setProduct({ ...product, variants: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] font-mono bg-white"
                    />
                  </div>

                  {/* Price Adjustment */}
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      placeholder="Price Adj (₹)"
                      value={v.price_adjustment ?? 0}
                      onChange={(e) => {
                        const updated = [...(product.variants || [])];
                        updated[idx].price_adjustment = Number(e.target.value);
                        setProduct({ ...product, variants: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] bg-white"
                    />
                  </div>

                  {/* In Stock + Delete */}
                  <div className="sm:col-span-3 flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.in_stock === 1}
                        onChange={(e) => {
                          const updated = [...(product.variants || [])];
                          updated[idx].in_stock = e.target.checked ? 1 : 0;
                          setProduct({ ...product, variants: updated });
                        }}
                        className="rounded text-[#2C221E]"
                      />
                      <span>In Stock</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1 ml-auto cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Thumbnail Image + Preview Image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EDE8DE]">
                  {/* Thumbnail Image (small color swatch icon) */}
                  <div>
                    <p className="text-[10.5px] uppercase font-bold tracking-wider text-[#8C827A] mb-1.5">
                      Swatch Thumbnail (small icon shown in color selector)
                    </p>
                    <div className="flex items-center gap-2">
                      {v.thumbnail_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.thumbnail_image}
                          alt="Thumbnail"
                          className="w-10 h-10 rounded-lg object-cover border border-[#EDE8DE] shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="/images/... or R2 URL"
                        value={v.thumbnail_image || ''}
                        onChange={(e) => {
                          const updated = [...(product.variants || [])];
                          updated[idx].thumbnail_image = e.target.value || null;
                          setProduct({ ...product, variants: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#D5CDBF] text-[11.5px] font-mono bg-white"
                      />
                      <label className="px-2.5 py-1.5 rounded-lg border border-[#D5CDBF] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[11px] font-semibold text-[#1C1917] cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingVariantImage === idx ? '…' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadVariantImage(e, idx, 'thumbnail_image')}
                          disabled={uploadingVariantImage !== null}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview Image (full-size gallery swap) */}
                  <div>
                    <p className="text-[10.5px] uppercase font-bold tracking-wider text-[#8C827A] mb-1.5">
                      Preview Image (gallery swaps to this when variant selected)
                    </p>
                    <div className="flex items-center gap-2">
                      {v.preview_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.preview_image}
                          alt="Preview"
                          className="w-10 h-10 rounded-lg object-cover border border-[#EDE8DE] shrink-0"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="/images/... or R2 URL"
                        value={v.preview_image || ''}
                        onChange={(e) => {
                          const updated = [...(product.variants || [])];
                          updated[idx].preview_image = e.target.value || null;
                          setProduct({ ...product, variants: updated });
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#D5CDBF] text-[11.5px] font-mono bg-white"
                      />
                      <label className="px-2.5 py-1.5 rounded-lg border border-[#D5CDBF] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[11px] font-semibold text-[#1C1917] cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>{uploadingVariantImage === idx ? '…' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadVariantImage(e, idx, 'preview_image')}
                          disabled={uploadingVariantImage !== null}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Tab 3 Footer: Variants & Colors -> Specifications ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE8DE] mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('images');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Product Images</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
              >
                <Save className="w-4 h-4 text-[#9A7B56]" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('specs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: Specifications</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: Specifications ─── */}
      {activeTab === 'specs' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DE]">
            <div>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">Technical Specifications</h2>
              <p className="text-[12.5px] text-[#78716C]">
                Key material, weave, opacity, weight, and care specifications displayed in the specifications table.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSpec}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5CDBF] text-[12.5px] font-semibold text-[#1C1917] hover:border-[#1C1917] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specification</span>
            </button>
          </div>

          <div className="space-y-3">
            {(product.specifications || []).map((s, idx) => (
              <div key={s.id || idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Label (e.g. Composition, Opacity, Width)"
                  value={s.label || ''}
                  onChange={(e) => {
                    const updated = [...(product.specifications || [])];
                    updated[idx].label = e.target.value;
                    setProduct({ ...product, specifications: updated });
                  }}
                  className="w-1/3 px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13px] bg-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 100% Belgian Flax Linen, 100% Blackout)"
                  value={s.value || ''}
                  onChange={(e) => {
                    const updated = [...(product.specifications || [])];
                    updated[idx].value = e.target.value;
                    setProduct({ ...product, specifications: updated });
                  }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13px] bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="text-rose-600 hover:text-rose-800 p-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* ─── Tab 4 Footer: Specifications -> Customization Rules ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE8DE] mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('variants');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Variants & Colors</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
              >
                <Save className="w-4 h-4 text-[#9A7B56]" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('customization');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer"
              >
                <span>Next: Customization Rules</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: Customization Rules ─── */}
      {activeTab === 'customization' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DE]">
            <div>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">Bespoke Customization Rules</h2>
              <p className="text-[12.5px] text-[#78716C]">
                Configure customizable inputs for this specific product without forcing curtain-specific fields onto other goods.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCustomConfig}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5CDBF] text-[12.5px] font-semibold text-[#1C1917] hover:border-[#1C1917] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customization Rule</span>
            </button>
          </div>

          <div className="space-y-4">
            {(product.customization_configs || []).map((cfg, idx) => (
              <div key={cfg.id || idx} className="p-4 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2]/50 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                    <input
                      type="text"
                      placeholder="Field Key (e.g. dimensions, heading_style)"
                      value={cfg.field_key || ''}
                      onChange={(e) => {
                        const updated = [...(product.customization_configs || [])];
                        updated[idx].field_key = e.target.value;
                        setProduct({ ...product, customization_configs: updated });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] font-mono bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Field Label (e.g. Pleat Style, Width & Drop)"
                      value={cfg.field_label || ''}
                      onChange={(e) => {
                        const updated = [...(product.customization_configs || [])];
                        updated[idx].field_label = e.target.value;
                        setProduct({ ...product, customization_configs: updated });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] bg-white"
                    />
                    <select
                      value={cfg.field_type || 'select'}
                      onChange={(e) => {
                        const updated = [...(product.customization_configs || [])];
                        updated[idx].field_type = e.target.value as 'dimension_pair' | 'select' | 'number' | 'text' | 'boolean';
                        setProduct({ ...product, customization_configs: updated });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] bg-white"
                    >
                      <option value="select">Dropdown Select</option>
                      <option value="dimension_pair">Dimension Pair (Width & Drop)</option>
                      <option value="number">Number (Quantity / Metres)</option>
                      <option value="text">Custom Text</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomConfig(idx)}
                    className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {cfg.field_type === 'select' && (
                  <div>
                    <label className="block text-[10.5px] font-semibold uppercase tracking-wider text-[#8C827A] mb-1">
                      Options (comma-separated):
                    </label>
                    <input
                      type="text"
                      placeholder="Eyelet, Pinch Pleat, American Pleat, Ripple Fold..."
                      value={formatOptionsForInput(cfg.options)}
                      onChange={(e) => {
                        const updated = [...(product.customization_configs || [])];
                        updated[idx].options = e.target.value;
                        setProduct({ ...product, customization_configs: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#D5CDBF] text-[12.5px] bg-white"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ─── Tab 5 Footer: Customization Rules -> Complete & Save ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#EDE8DE] mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('specs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5CDBF] text-[#57534E] hover:text-[#1C1917] hover:border-[#1C1917] text-[13px] font-semibold transition-all cursor-pointer bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Specifications</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving to D1...' : 'Complete & Save Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
