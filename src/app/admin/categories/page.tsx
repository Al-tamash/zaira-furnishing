'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  Check,
  X,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { DbCategory, DbSubcategory } from '@/lib/db/types';

interface ExtendedCategory extends DbCategory {
  product_count: number;
  subcategory_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCatId, setExpandedCatId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Record<string, DbSubcategory[]>>({});
  
  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<DbCategory> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Subcategory modal state
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<DbSubcategory> | null>(null);

  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'disabled'>('active');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const activeCategories = categories.filter((c) => c.active === 1);
  const disabledCategories = categories.filter((c) => c.active === 0);
  const displayedCategories =
    filterStatus === 'active'
      ? activeCategories
      : filterStatus === 'disabled'
      ? disabledCategories
      : categories;

  const toggleSubcategories = async (catId: string) => {
    if (expandedCatId === catId) {
      setExpandedCatId(null);
      return;
    }

    setExpandedCatId(catId);
    if (!subcategories[catId]) {
      try {
        const res = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
        const data = await res.json();
        setSubcategories((prev) => ({ ...prev, [catId]: data.data || [] }));
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
      }
    }
  };

  // Image Upload handler for Category
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'categories');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setEditingCategory((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Image Upload handler for Subcategory
  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'subcategories');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setEditingSubcategory((prev) => (prev ? { ...prev, image: data.url } : prev));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name || !editingCategory?.slug) return;

    setSubmitting(true);
    try {
      const isEdit = !!editingCategory.id;
      const res = await fetch('/api/admin/categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save category');
      }

      setModalOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (cat: ExtendedCategory) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, active: cat.active === 1 ? 0 : 1 }),
      });
      await fetchCategories();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories?id=${catId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');
      if (data.message) {
        alert(data.message);
      }
      setModalOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting category');
    }
  };

  const handleDeleteSubcategory = async (subId: string, subName: string, catId: string) => {
    if (!window.confirm(`Are you sure you want to delete subcategory "${subName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/subcategories?id=${subId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete subcategory');
      
      setSubModalOpen(false);
      setEditingSubcategory(null);

      const subRes = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
      const subData = await subRes.json();
      setSubcategories((prev) => ({ ...prev, [catId]: subData.data || [] }));
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting subcategory');
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubcategory?.name || !editingSubcategory?.slug || !editingSubcategory?.category_id) return;

    setSubmitting(true);
    try {
      const isEdit = !!editingSubcategory.id;
      const res = await fetch('/api/admin/subcategories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSubcategory),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save subcategory');
      }

      const catId = editingSubcategory.category_id;
      setSubModalOpen(false);
      setEditingSubcategory(null);

      // Refresh subcategories for this category
      const subRes = await fetch(`/api/admin/subcategories?categoryId=${catId}`);
      const subData = await subRes.json();
      setSubcategories((prev) => ({ ...prev, [catId]: subData.data || [] }));
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Category Management
          </span>
          <h1 className="font-serif text-[24px] sm:text-[28px] text-[#1C1917] font-medium">
            Catalog Categories ({displayedCategories.length})
          </h1>
          <p className="text-[13px] text-[#78716C]">
            {activeCategories.length} active official Zaira Furnishing categories and genuine subcategories stored in D1.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory({
              name: '',
              slug: '',
              tagline: '',
              description: '',
              image: '/images/hero/living_room.jpg',
              display_order: categories.length,
              active: 1,
              featured: 1,
              is_customizable: 0,
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* ─── Filter Status Tabs ─── */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#EDE8DE] shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => setFilterStatus('active')}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
            filterStatus === 'active'
              ? 'bg-[#2C221E] text-white'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-stone-100'
          }`}
        >
          Active Catalog ({activeCategories.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-[#2C221E] text-white'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-stone-100'
          }`}
        >
          All Categories ({categories.length})
        </button>
        {disabledCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setFilterStatus('disabled')}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
              filterStatus === 'disabled'
                ? 'bg-[#2C221E] text-white'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-stone-100'
            }`}
          >
            Disabled ({disabledCategories.length})
          </button>
        )}
      </div>

      {/* ─── Category Table ─── */}
      <div className="bg-white rounded-2xl border border-[#EDE8DE] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#78716C]">
            <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px]">Loading categories from Cloudflare D1...</p>
          </div>
        ) : displayedCategories.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">
            <p className="text-[14px] font-medium text-[#1C1917]">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2ECE1]">
            {displayedCategories.map((cat, idx) => {
              const isExpanded = expandedCatId === cat.id;
              const catSubs = subcategories[cat.id] || [];

              return (
                <div key={cat.id} className="transition-colors hover:bg-[#FAF7F2]/50">
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Image & Name */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="text-[11px] font-mono text-[#8C827A] w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-12 h-12 rounded-xl bg-[#F7F4EE] border border-[#EDE8DE] overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.image || '/images/hero/living_room.jpg'}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14.5px] font-serif font-medium text-[#1C1917] truncate">
                            {cat.name}
                          </h3>
                          {cat.featured === 1 && (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] uppercase font-bold bg-[#9A7B56]/15 text-[#9A7B56]">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#78716C] truncate mt-0.5">
                          /{cat.slug} · {cat.product_count} products
                          {cat.subcategory_count > 0 && ` · ${cat.subcategory_count} genuine types`}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                          cat.active === 1
                            ? 'bg-[#15803D]/10 text-[#9A7B56] border-[#15803D]/20'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                      >
                        {cat.active === 1 ? 'Active' : 'Disabled'}
                      </button>

                      {cat.subcategory_count > 0 && (
                        <button
                          onClick={() => toggleSubcategories(cat.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EDE8DE] hover:border-[#2C221E] text-[12px] font-medium text-[#1C1917] transition-all cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#9A7B56]" />
                          <span>Subcategories ({cat.subcategory_count})</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-[#57534E] hover:text-[#9A7B56] hover:bg-black/5 transition-all cursor-pointer"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories Collapsible Area */}
                  {isExpanded && (
                    <div className="bg-[#FAF7F2] border-t border-[#EDE8DE] px-6 sm:px-12 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
                          Genuine Types under {cat.name}
                        </span>
                        <button
                          onClick={() => {
                            setEditingSubcategory({
                              category_id: cat.id,
                              name: '',
                              slug: '',
                              description: '',
                              image: cat.image,
                              display_order: catSubs.length,
                              active: 1,
                            });
                            setSubModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Subcategory Type</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-white p-3 rounded-xl border border-[#EDE8DE] flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {sub.image && (
                                <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE] overflow-hidden shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-[#1C1917] truncate">{sub.name}</p>
                                <span className="text-[11px] text-[#8C827A]">/{sub.slug}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingSubcategory(sub);
                                  setSubModalOpen(true);
                                }}
                                className="p-1 text-[#8C827A] hover:text-[#9A7B56] cursor-pointer"
                                title="Edit subcategory"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id, sub.name, cat.id)}
                                className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                title="Delete subcategory"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Category Edit Modal ─── */}
      {modalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DE] mb-5">
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-[#8C827A] hover:text-[#1C1917]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name: nameVal,
                      slug: editingCategory.id ? editingCategory.slug : generateSlug(nameVal),
                    });
                  }}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Slug (URL Key)
                </label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13.5px] font-mono focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={editingCategory.tagline || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13.5px] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              {/* Image Input & R2 Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Category Image (Cloudflare R2 or Path)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingCategory.image || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5CDBF] text-[13px] font-mono focus:outline-hidden focus:border-[#9A7B56]"
                  />
                  <label className="px-3.5 py-2 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[12px] font-semibold text-[#1C1917] cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] cursor-pointer text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={editingCategory.featured === 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, featured: e.target.checked ? 1 : 0 })}
                    className="rounded text-[#2C221E]"
                  />
                  <span>Featured on Home</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] cursor-pointer text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={editingCategory.active === 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked ? 1 : 0 })}
                    className="rounded text-[#2C221E]"
                  />
                  <span>Active Status</span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EDE8DE]">
                {editingCategory.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory.id!, editingCategory.name || '')}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Category</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D5CDBF] text-[12.5px] font-medium text-[#1C1917] hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="px-5 py-2 rounded-xl bg-[#2C221E] text-white text-[12.5px] font-semibold hover:bg-[#2C221E] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save to D1'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Subcategory Edit Modal ─── */}
      {subModalOpen && editingSubcategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE8DE] mb-4">
              <h2 className="font-serif text-[17px] text-[#1C1917] font-medium">
                {editingSubcategory.id ? 'Edit Subcategory' : 'Add Subcategory Type'}
              </h2>
              <button
                onClick={() => setSubModalOpen(false)}
                className="p-1 rounded-lg text-[#8C827A] hover:text-[#1C1917]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Type Name
                </label>
                <input
                  type="text"
                  value={editingSubcategory.name || ''}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    setEditingSubcategory({
                      ...editingSubcategory,
                      name: nameVal,
                      slug: editingSubcategory.id ? editingSubcategory.slug : generateSlug(nameVal),
                    });
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBF] text-[13px] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={editingSubcategory.slug || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBF] text-[13px] font-mono focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingSubcategory.description || ''}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBF] text-[13px] focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>

              {/* Subcategory Image Input & Upload */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Subcategory Image (Cloudflare R2 or Path)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/images/..."
                    value={editingSubcategory.image || ''}
                    onChange={(e) => setEditingSubcategory({ ...editingSubcategory, image: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#D5CDBF] text-[12px] font-mono focus:outline-hidden focus:border-[#9A7B56]"
                  />
                  <label className="px-3 py-2 rounded-xl border border-[#D5CDBF] bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[11.5px] font-semibold text-[#1C1917] cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-[#EDE8DE]">
                {editingSubcategory.id ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSubcategory(editingSubcategory.id!, editingSubcategory.name || '', editingSubcategory.category_id!)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-[12px] font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSubModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#D5CDBF] text-[12px] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-xl bg-[#2C221E] text-white text-[12px] font-semibold hover:bg-[#2C221E]"
                  >
                    Save Subcategory
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
