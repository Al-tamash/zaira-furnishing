'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Package,
  RotateCcw,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { DbProduct, DbCategory } from '@/lib/db/types';

interface ExtendedProduct extends DbProduct {
  category_name: string;
  category_slug: string;
  subcategory_name?: string;
  main_image?: string;
  variant_count: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [allProductsCount, setAllProductsCount] = useState<number>(0);
  const [trashCount, setTrashCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedActive, setSelectedActive] = useState('1'); // '1' = Active, '0' = Trash, '' = All
  const [recentlyDeleted, setRecentlyDeleted] = useState<{ id: string; name: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories?active=1');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch count statistics across all, active, and trash
  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const json = await res.json();
      const all: ExtendedProduct[] = json.data || [];
      setAllProductsCount(all.length);
      setActiveCount(all.filter((p) => p.active === 1).length);
      setTrashCount(all.filter((p) => p.active === 0).length);
    } catch (err) {
      console.error('Failed to fetch product counts:', err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedActive !== '') params.append('active', selectedActive);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedActive]);

  useEffect(() => {
    fetchCategories();
    fetchCounts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleToggleActive = async (product: ExtendedProduct) => {
    try {
      const newStatus = product.active === 1 ? 0 : 1;
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });
      await fetchProducts();
      await fetchCounts();
      setNotification(`Product "${product.name}" is now ${newStatus === 1 ? 'Active' : 'Archived'}.`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleToggleFeatured = async (product: ExtendedProduct) => {
    try {
      const newFeatured = product.featured === 1 ? 0 : 1;
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: newFeatured }),
      });
      await fetchProducts();
      await fetchCounts();
    } catch (err) {
      console.error('Toggle featured error:', err);
    }
  };

  // Restore product by ID
  const handleRestoreProductById = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: 1 }),
      });
      if (!res.ok) throw new Error('Failed to restore product');
      await fetchProducts();
      await fetchCounts();
      setNotification('Product restored successfully!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error restoring product');
    }
  };

  // Delete product (Soft delete to trash, or permanent if already in trash)
  const handleDeleteProduct = async (product: ExtendedProduct) => {
    const isAlreadyInTrash = product.active === 0;

    if (isAlreadyInTrash) {
      if (!window.confirm(`Permanently delete "${product.name}" from database? This cannot be undone.`)) {
        return;
      }
      try {
        const res = await fetch(`/api/admin/products/${product.id}?permanent=true`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete product permanently');
        await fetchProducts();
        await fetchCounts();
        setNotification(`Product "${product.name}" permanently deleted.`);
        setTimeout(() => setNotification(null), 4000);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error deleting product');
      }
      return;
    }

    // Soft delete / Move to trash
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to move product to trash');
      setRecentlyDeleted({ id: product.id, name: product.name });
      await fetchProducts();
      await fetchCounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error archiving product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Cloudflare D1 Catalog
          </span>
          <h1 className="font-serif text-[24px] sm:text-[28px] text-[#1C1917] font-medium">
            Products ({selectedActive === '1' ? activeCount : selectedActive === '0' ? trashCount : allProductsCount})
          </h1>
          <p className="text-[13px] text-[#78716C]">
            Manage all active catalog items, specifications, variants, and bespoke customization configurations.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* ─── Notification / Undo Banner ─── */}
      {recentlyDeleted && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Archive className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-[13px] font-medium">
              &quot;{recentlyDeleted.name}&quot; moved to Trash. You can restore it anytime.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await handleRestoreProductById(recentlyDeleted.id);
                setRecentlyDeleted(null);
              }}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#2C221E] hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo / Restore Now</span>
            </button>
            <button
              onClick={() => setRecentlyDeleted(null)}
              className="text-amber-700 hover:text-amber-950 text-[12px] font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl border border-[#E8DFC8] bg-[#FBF8F3] text-[#5C4326] text-[12.5px] font-medium shadow-2xs">
          <CheckCircle className="w-4 h-4 text-[#9A7B56] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── View / Status Pill Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-[#EDE8DE] pb-2 overflow-x-auto">
        <button
          onClick={() => setSelectedActive('1')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedActive === '1'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span>Active Catalog</span>
          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
            selectedActive === '1' ? 'bg-white/20 text-white' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedActive('')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedActive === ''
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <span>All Products</span>
          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
            selectedActive === '' ? 'bg-white/20 text-white' : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            {allProductsCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedActive('0')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedActive === '0'
              ? 'bg-[#2C221E] text-white shadow-2xs'
              : trashCount > 0
              ? 'text-amber-800 bg-amber-50 hover:bg-amber-100/70 border border-amber-200'
              : 'text-[#57534E] hover:bg-[#FAF7F2]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Trash / Inactive</span>
          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
            selectedActive === '0'
              ? 'bg-white/20 text-white'
              : trashCount > 0
              ? 'bg-amber-200 text-amber-900'
              : 'bg-[#EDE8DE] text-[#57534E]'
          }`}>
            {trashCount}
          </span>
        </button>
      </div>

      {/* ─── Filters & Search ─── */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, slug, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#9A7B56]"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] text-[13px] font-sans font-medium text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Products Table ─── */}
      <div className="bg-white rounded-2xl border border-[#EDE8DE] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#78716C]">
            <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px]">Querying Cloudflare D1 database...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">
            <Package className="w-8 h-8 text-[#8C827A] mx-auto mb-2" />
            <p className="text-[14px] font-medium text-[#1C1917]">
              {selectedActive === '0' ? 'Trash is empty' : 'No products matched your criteria'}
            </p>
            <p className="text-[12px] text-[#78716C] mt-1">
              {selectedActive === '0' ? 'No deleted or archived products.' : 'Try clearing filters or search terms.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2ECE1]">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  p.active === 0 ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-[#FAF7F2]/50'
                }`}
              >
                {/* Product Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="text-[11px] font-mono text-[#8C827A] w-6 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-[#EDE8DE] overflow-hidden shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.main_image || '/images/hero/living_room.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-[14px] font-semibold truncate ${
                        p.active === 0 ? 'text-[#78716C] line-through' : 'text-[#1C1917]'
                      }`}>
                        {p.name}
                      </h3>
                      {p.active === 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-bold uppercase tracking-wider">
                          In Trash / Inactive
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EDE8DE] text-[#57534E]">
                        {p.product_type === 'custom_made' ? 'Custom Made' : 'Standard'}
                      </span>
                      {p.featured === 1 && (
                        <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#9A7B56]/15 text-[#9A7B56]">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#78716C] truncate mt-0.5">
                      {p.category_name} {p.subcategory_name ? `· ${p.subcategory_name}` : ''} · /{p.slug}
                    </p>
                    <span className="text-[11.5px] text-[#8C827A]">
                      {p.variant_count} color/material options
                    </span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F2ECE1]">
                  <div className="text-right">
                    <span className="font-sans text-[15px] font-bold text-[#1C1917] block">
                      {p.starting_price === 1 ? 'From ' : ''}₹{p.base_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-[#8C827A]">/{p.unit || 'piece'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {p.active === 0 ? (
                      /* Restore Button for deleted/inactive product */
                      <button
                        onClick={() => handleRestoreProductById(p.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold bg-[#2C221E] text-white hover:bg-[#2C221E] transition-all cursor-pointer shadow-2xs"
                        title="Restore this product to the active catalog"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Product</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                            p.featured === 1
                              ? 'bg-[#9A7B56] text-white border-[#9A7B56]'
                              : 'border-[#EDE8DE] text-[#78716C] hover:border-[#9A7B56]'
                          }`}
                          title="Toggle homepage featured"
                        >
                          ★ {p.featured === 1 ? 'Featured' : 'Regular'}
                        </button>

                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition-all cursor-pointer ${
                            p.active === 1
                              ? 'bg-[#15803D]/10 text-[#9A7B56] border-[#15803D]/20'
                              : 'bg-stone-100 text-stone-500 border-stone-200'
                          }`}
                        >
                          {p.active === 1 ? 'Active' : 'Disabled'}
                        </button>
                      </>
                    )}

                    <Link
                      href={`/admin/products/${p.id}`}
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#9A7B56] hover:bg-black/5 transition-all"
                      title="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>

                    {p.active === 1 && (
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-[#8C827A] hover:text-[#9A7B56] hover:bg-black/5 transition-all"
                        title="Preview on live site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        p.active === 0
                          ? 'text-rose-700 hover:text-rose-900 hover:bg-rose-100'
                          : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                      }`}
                      title={p.active === 0 ? 'Delete permanently' : 'Move to trash'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
