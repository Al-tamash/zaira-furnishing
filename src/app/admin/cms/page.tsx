'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Upload,
  Home,
  Star,
  BookOpen,
  MapPin,
  PanelBottom,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DbCmsContent } from '@/lib/db/types';

type CmsTab = 'home_hero' | 'home_featured_furnishings' | 'home_brand_story' | 'home_showroom_contact' | 'site_footer';

export default function AdminCmsPage() {
  const [sections, setSections] = useState<Record<string, DbCmsContent>>({});
  const [activeTab, setActiveTab] = useState<CmsTab>('home_hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states per section
  const [formData, setFormData] = useState<any>({});
  const [featuredSlugsText, setFeaturedSlugsText] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cms');
      if (!res.ok) throw new Error('Failed to load CMS content');
      const data = await res.json();
      setSections(data.data || {});

      // Parse JSON content into working formData
      const initialForm: any = {};
      for (const [key, sec] of Object.entries(data.data as Record<string, DbCmsContent>)) {
        let parsedContent: any = {};
        if (sec.content) {
          try {
            parsedContent = JSON.parse(sec.content);
          } catch {
            parsedContent = { raw: sec.content };
          }
        }
        initialForm[key] = {
          title: sec.title || '',
          subtitle: sec.subtitle || '',
          image_url: sec.image_url || '',
          secondary_image_url: sec.secondary_image_url || '',
          content: parsedContent,
        };
      }
      setFormData(initialForm);

      // Initialize featured slugs text if available
      const featuredSec = initialForm['home_featured_furnishings'];
      if (featuredSec?.content?.featured_slugs && Array.isArray(featuredSec.content.featured_slugs)) {
        setFeaturedSlugsText(featuredSec.content.featured_slugs.join(', '));
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCms();
  }, [fetchCms]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        [field]: value,
      },
    }));
  };

  const handleContentChange = (contentKey: string, value: any) => {
    setFormData((prev: any) => {
      const currentSection = prev[activeTab] || {};
      const currentContent = currentSection.content || {};
      return {
        ...prev,
        [activeTab]: {
          ...currentSection,
          content: {
            ...currentContent,
            [contentKey]: value,
          },
        },
      };
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: 'image_url' | 'secondary_image_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', 'cms');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      handleFieldChange(targetField, data.url);
      showToast('Image uploaded successfully to Cloudflare R2');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentData = { ...(formData[activeTab] || {}) };
      if (!currentData) return;

      // Special handling for featured slugs array in home_featured_furnishings tab
      if (activeTab === 'home_featured_furnishings') {
        const slugsArray = featuredSlugsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        currentData.content = {
          ...(currentData.content || {}),
          featured_slugs: slugsArray,
        };
      }

      const payload = {
        section_key: activeTab,
        title: currentData.title,
        subtitle: currentData.subtitle,
        image_url: currentData.image_url,
        secondary_image_url: currentData.secondary_image_url,
        content: currentData.content,
      };

      const res = await fetch('/api/admin/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save CMS section');

      showToast(`Updated "${tabInfo[activeTab].label}" successfully`);
      fetchCms();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const tabInfo: Record<CmsTab, { label: string; icon: any; desc: string }> = {
    home_hero: {
      label: 'Hero Section',
      icon: Home,
      desc: 'Top welcome banner with headline, subline, CTAs and photography',
    },
    home_featured_furnishings: {
      label: 'Featured Furnishings',
      icon: Star,
      desc: 'Highlighted product showcase cards on the homepage',
    },
    home_brand_story: {
      label: 'Brand Story / About',
      icon: BookOpen,
      desc: 'Warm brand introduction with dual imagery and atelier values',
    },
    home_showroom_contact: {
      label: 'Showroom Contact',
      icon: MapPin,
      desc: 'Physical location, showroom operating hours and visit invitation',
    },
    site_footer: {
      label: 'Site Footer',
      icon: PanelBottom,
      desc: 'Global footer branding, contact details and copyright info',
    },
  };

  const currentSectionData = formData[activeTab] || { content: {} };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 ${
            toast.type === 'success' ? 'bg-[#2C221E] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4 text-[#D4AF37]" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Live Content & Brand Copy
          </span>
          <h1 className="font-serif text-[24px] sm:text-[28px] text-[#1C1917] font-medium">
            Homepage CMS & Content
          </h1>
          <p className="text-[13px] text-[#78716C]">
            Manage live copy, images, and presentation blocks stored directly in Cloudflare D1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#EDE8DE] hover:border-[#2C221E] text-[12.5px] font-medium text-[#1C1917] transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#D5CDBF]" />
                <span>Save {tabInfo[activeTab].label}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Section Selector Tabs ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.keys(tabInfo) as CmsTab[]).map((tabKey) => {
          const info = tabInfo[tabKey];
          const Icon = info.icon;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                isActive
                  ? 'bg-white border-[#2C221E] shadow-sm ring-1 ring-[#2C221E]'
                  : 'bg-white/80 hover:bg-white border-[#EDE8DE] text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#2C221E] text-[#FAF7F2]' : 'bg-[#FAF7F2] text-[#8C827A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && <div className="w-2 h-2 rounded-full bg-[#15803D]"></div>}
              </div>
              <div className="text-[13px] font-semibold text-[#1C1917] truncate">{info.label}</div>
              <div className="text-[10.5px] font-mono text-[#8C827A] mt-0.5 truncate">{tabKey}</div>
            </button>
          );
        })}
      </div>

      {/* ─── Active Tab Editor Form ─── */}
      <div className="bg-white rounded-2xl border border-[#EDE8DE] shadow-2xs p-6 space-y-6">
        <div className="border-b border-[#F2ECE1] pb-4">
          <h2 className="font-serif text-[18px] text-[#1C1917] font-medium flex items-center gap-2">
            <span>{tabInfo[activeTab].label}</span>
            <span className="text-[12px] text-[#8C827A] font-mono">({activeTab})</span>
          </h2>
          <p className="text-[12.5px] text-[#78716C] mt-0.5">{tabInfo[activeTab].desc}</p>
        </div>

        {/* 1. HERO SECTION */}
        {activeTab === 'home_hero' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Eyebrow / Badge Text
                </label>
                <input
                  type="text"
                  value={currentSectionData.content?.eyebrow || ''}
                  onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="e.g. ZAIRA FURNISHING"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Main Heading (Title)
                </label>
                <input
                  type="text"
                  value={currentSectionData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-[14px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56] font-serif"
                  placeholder="e.g. Beautiful Furnishings for Your Home"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Subtitle / Supporting Description
              </label>
              <textarea
                rows={2}
                value={currentSectionData.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                placeholder="Curtains, blinds, wallpapers, rugs, flooring and more for your home."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#FAF7F2] rounded-2xl border border-[#EDE8DE]">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-[#1C1917] uppercase tracking-wider block">
                  Primary Call to Action
                </span>
                <div>
                  <label className="block text-[11px] text-[#78716C] mb-1">Button Label</label>
                  <input
                    type="text"
                    value={currentSectionData.content?.primary_cta_text || ''}
                    onChange={(e) => handleContentChange('primary_cta_text', e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl bg-white outline-none focus:border-[#9A7B56]"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78716C] mb-1">Target Link</label>
                  <input
                    type="text"
                    value={currentSectionData.content?.primary_cta_link || ''}
                    onChange={(e) => handleContentChange('primary_cta_link', e.target.value)}
                    className="w-full px-3.5 py-2 text-[12.5px] font-mono border border-[#D5CDBF] rounded-xl bg-white outline-none focus:border-[#9A7B56]"
                    placeholder="/products"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-[#1C1917] uppercase tracking-wider block">
                  Secondary Call to Action
                </span>
                <div>
                  <label className="block text-[11px] text-[#78716C] mb-1">Button Label</label>
                  <input
                    type="text"
                    value={currentSectionData.content?.secondary_cta_text || ''}
                    onChange={(e) => handleContentChange('secondary_cta_text', e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl bg-white outline-none focus:border-[#9A7B56]"
                    placeholder="Book a Free Visit"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#78716C] mb-1">Target Link</label>
                  <input
                    type="text"
                    value={currentSectionData.content?.secondary_cta_link || ''}
                    onChange={(e) => handleContentChange('secondary_cta_link', e.target.value)}
                    className="w-full px-3.5 py-2 text-[12.5px] font-mono border border-[#D5CDBF] rounded-xl bg-white outline-none focus:border-[#9A7B56]"
                    placeholder="/services"
                  />
                </div>
              </div>
            </div>

            {/* Primary Hero Image */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                Hero Background / Showcase Image
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-44 h-28 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] overflow-hidden shrink-0 relative">
                  {currentSectionData.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentSectionData.image_url}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8C827A] text-[11px]">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    value={currentSectionData.image_url || ''}
                    onChange={(e) => handleFieldChange('image_url', e.target.value)}
                    className="w-full px-3.5 py-2 text-[12.5px] border border-[#D5CDBF] rounded-xl font-mono focus:outline-hidden focus:border-[#9A7B56]"
                    placeholder="/images/hero/living_room.jpg or R2 URL"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5CDBF] text-[#1C1917] text-[12px] font-semibold rounded-xl transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Image (R2)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'image_url')}
                      />
                    </label>
                    <span className="text-[11px] text-[#8C827A]">Uploaded directly to Cloudflare R2 bucket</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FEATURED FURNISHINGS */}
        {activeTab === 'home_featured_furnishings' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={currentSectionData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56] font-serif"
                  placeholder="Featured Furnishings"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={currentSectionData.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Explore selected furnishings from Zaira."
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Featured Product Slugs (Comma-separated)
              </label>
              <textarea
                rows={3}
                value={featuredSlugsText}
                onChange={(e) => setFeaturedSlugsText(e.target.value)}
                className="w-full px-3.5 py-2 text-[12.5px] border border-[#D5CDBF] rounded-xl font-mono focus:outline-hidden focus:border-[#9A7B56]"
                placeholder="blackout-curtains, roma-textured-boucle-upholstery, roller-blinds, solis-hand-tufted-wool-silk-rug, monaco-crush-resistant-matte-velvet"
              />
              <p className="text-[11px] text-[#8C827A] mt-1">
                Enter product slugs separated by commas. Matches active products in Cloudflare D1.
              </p>
            </div>
          </div>
        )}

        {/* 3. BRAND STORY */}
        {activeTab === 'home_brand_story' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={currentSectionData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56] font-serif"
                  placeholder="About Zaira Furnishing"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Subtitle / Category Label
                </label>
                <input
                  type="text"
                  value={currentSectionData.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Furnishings & Services"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Paragraph 1 (Introduction)
                </label>
                <textarea
                  rows={2}
                  value={currentSectionData.content?.paragraph1 || ''}
                  onChange={(e) => handleContentChange('paragraph1', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Paragraph 2 (Catalog Scope)
                </label>
                <textarea
                  rows={2}
                  value={currentSectionData.content?.paragraph2 || ''}
                  onChange={(e) => handleContentChange('paragraph2', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Paragraph 3 (Services & Support)
                </label>
                <textarea
                  rows={2}
                  value={currentSectionData.content?.paragraph3 || ''}
                  onChange={(e) => handleContentChange('paragraph3', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={currentSectionData.content?.cta_text || ''}
                  onChange={(e) => handleContentChange('cta_text', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Learn More"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  CTA Target Link
                </label>
                <input
                  type="text"
                  value={currentSectionData.content?.cta_link || ''}
                  onChange={(e) => handleContentChange('cta_link', e.target.value)}
                  className="w-full px-3.5 py-2 text-[12.5px] font-mono border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="/about"
                />
              </div>
            </div>

            {/* Dual Images for Brand Story */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F2ECE1]">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Primary Showcase Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-20 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] overflow-hidden shrink-0 relative">
                    {currentSectionData.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentSectionData.image_url} alt="Main" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C827A] text-[10px]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={currentSectionData.image_url || ''}
                      onChange={(e) => handleFieldChange('image_url', e.target.value)}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#D5CDBF] rounded-lg font-mono focus:outline-hidden focus:border-[#9A7B56]"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5CDBF] text-[#1C1917] text-[11.5px] font-semibold rounded-lg">
                      <Upload className="w-3 h-3" />
                      <span>Upload (R2)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'image_url')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-2">
                  Secondary Interior Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-20 rounded-xl border border-[#EDE8DE] bg-[#FAF7F2] overflow-hidden shrink-0 relative">
                    {currentSectionData.secondary_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentSectionData.secondary_image_url} alt="Secondary" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C827A] text-[10px]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={currentSectionData.secondary_image_url || ''}
                      onChange={(e) => handleFieldChange('secondary_image_url', e.target.value)}
                      className="w-full px-3 py-1.5 text-[12px] border border-[#D5CDBF] rounded-lg font-mono focus:outline-hidden focus:border-[#9A7B56]"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D5CDBF] text-[#1C1917] text-[11.5px] font-semibold rounded-lg">
                      <Upload className="w-3 h-3" />
                      <span>Upload (R2)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'secondary_image_url')}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. SHOWROOM CONTACT */}
        {activeTab === 'home_showroom_contact' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={currentSectionData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl font-serif focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Visit the Zaira Showroom"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={currentSectionData.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="See fabrics, furnishings and finishes in person..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Showroom Address
                </label>
                <textarea
                  rows={3}
                  value={currentSectionData.content?.address || ''}
                  onChange={(e) => handleContentChange('address', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={currentSectionData.content?.hours || ''}
                    onChange={(e) => handleContentChange('hours', e.target.value)}
                    className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                    placeholder="Mon–Sat 10:30 AM–8:30 PM · Sunday by appointment"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={currentSectionData.content?.phone || ''}
                      onChange={(e) => handleContentChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentSectionData.content?.email || ''}
                      onChange={(e) => handleContentChange('email', e.target.value)}
                      className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                Google Maps Direction URL
              </label>
              <input
                type="text"
                value={currentSectionData.content?.maps_query || ''}
                onChange={(e) => handleContentChange('maps_query', e.target.value)}
                className="w-full px-3.5 py-2 text-[12.5px] border border-[#D5CDBF] rounded-xl font-mono focus:outline-hidden focus:border-[#9A7B56]"
              />
            </div>
          </div>
        )}

        {/* 5. SITE FOOTER */}
        {activeTab === 'site_footer' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Brand Name / Headline
                </label>
                <input
                  type="text"
                  value={currentSectionData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl font-serif focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Zaira Furnishing"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={currentSectionData.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13.5px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="Curtains, blinds, fabrics and furnishings for thoughtfully designed spaces."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Showroom Address
                </label>
                <textarea
                  rows={2}
                  value={currentSectionData.content?.address || ''}
                  onChange={(e) => handleContentChange('address', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={currentSectionData.content?.copyright || ''}
                  onChange={(e) => handleContentChange('copyright', e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] border border-[#D5CDBF] rounded-xl focus:outline-hidden focus:border-[#9A7B56]"
                  placeholder="© 2026 Zaira Furnishing. All rights reserved."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

