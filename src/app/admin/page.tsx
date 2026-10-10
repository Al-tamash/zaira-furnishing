'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Grid,
  Package,
  Wrench,
  FileText,
  ShoppingBag,
  ArrowRight,
  Plus,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AdminStats {
  ordersCount: number;
  productsCount: number;
  activeProductsCount: number;
  categoriesCount: number;
  activeCategoriesCount: number;
  subcategoriesCount: number;
  servicesCount: number;
  cmsBlocksCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [ordersRes, catsRes, prodsRes, srvsRes, cmsRes] = await Promise.all([
          fetch('/api/admin/orders?limit=1'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/products'),
          fetch('/api/admin/services'),
          fetch('/api/admin/cms'),
        ]);

        const ordersData = ordersRes.ok ? await ordersRes.json() : { total: 0 };
        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        const srvsData = await srvsRes.json();
        const cmsData = await cmsRes.json();

        const prods = prodsData.data || [];
        const cats = catsData.data || [];
        const srvs = srvsData.data || [];
        const cms = Object.keys(cmsData.data || {}).length;

        const subCount = cats.reduce((acc: number, c: { subcategory_count?: number }) => acc + (c.subcategory_count || 0), 0);
        const activeCats = cats.filter((c: { active: number }) => c.active === 1).length;

        setStats({
          ordersCount: ordersData.total || 0,
          productsCount: prods.length,
          activeProductsCount: prods.filter((p: { active: number }) => p.active === 1).length,
          categoriesCount: cats.length,
          activeCategoriesCount: activeCats,
          subcategoriesCount: subCount,
          servicesCount: srvs.length,
          cmsBlocksCount: cms,
        });

        setRecentProducts(prods.slice(0, 5));
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Page Title Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Cloudflare D1 & R2 Connected
          </span>
          <h1 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-medium tracking-tight">
            Atelier Catalog & CMS Console
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-1">
            Real-time control over Zaira Furnishing categories, products, atelier services, and homepage content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1714] hover:bg-[#2C221E] text-white text-[12.5px] font-semibold transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#D5CDBF] text-[#1C1917] text-[12.5px] font-medium hover:border-[#1C1917] transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#9A7B56]" />
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Customer Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#9A7B56]/15 flex items-center justify-center text-[#9A7B56]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.ordersCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Cloudflare D1 order ledger</span>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Manage Orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Catalog Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2C221E]/10 flex items-center justify-center text-[#2C221E]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.productsCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>{stats?.activeProductsCount || 0} currently active on website</span>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Categories */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Product Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#9A7B56]/10 flex items-center justify-center text-[#9A7B56]">
              <Grid className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.categoriesCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>{stats?.activeCategoriesCount ?? 9} active catalog sections</span>
            </div>
          </div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Manage Categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Services */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Atelier Services
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#3D6352]/10 flex items-center justify-center text-[#3D6352]">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.servicesCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Home measurement & bespoke fitting</span>
            </div>
          </div>
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Configure Services</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* CMS Content */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              CMS Sections
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 flex items-center justify-center text-[#9A7B56]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.cmsBlocksCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Hero, Brand, Showroom, Footer</span>
            </div>
          </div>
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Edit Homepage CMS</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ─── Recent Products & Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Catalog Products */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-[18px] text-[#1C1917] font-medium">
                Catalog Products
              </h2>
              <span className="text-[12px] text-[#78716C]">
                Loaded directly from Cloudflare D1
              </span>
            </div>
            <Link
              href="/admin/products"
              className="text-[12px] font-semibold text-[#2C221E] hover:text-[#9A7B56]"
            >
              View All ({stats?.productsCount || 0}) →
            </Link>
          </div>

          <div className="divide-y divide-[#F2ECE1]">
            {recentProducts.map((p) => (
              <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#FAF7F2] border border-[#EDE8DE] overflow-hidden shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.main_image || '/images/hero/living_room.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1C1917] truncate">
                      {p.name}
                    </p>
                    <span className="text-[11.5px] text-[#8C827A]">
                      {p.category_name} · {p.product_type === 'custom_made' ? 'Custom Made' : 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-serif text-[13.5px] font-bold text-[#1C1917]">
                    {p.starting_price === 1 ? 'From ' : ''}₹{p.base_price.toLocaleString('en-IN')}
                  </span>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="px-3 py-1.5 rounded-lg border border-[#EDE8DE] hover:border-[#2C221E] text-[11.5px] font-medium text-[#1C1917] transition-all"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations & System Health */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#2C221E] text-white p-6 rounded-2xl border border-[#3D302A] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#9A7B56]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C4B9A1]">
                System Architecture
              </span>
            </div>
            <h3 className="font-serif text-[18px] font-medium mb-2">
              D1 Database Status
            </h3>
            <p className="text-[12.5px] text-[#A8A29E] leading-relaxed mb-4 font-light">
              Relational SQLite schema active with transactional foreign keys, indexed slugs, and real-time customer query resolution.
            </p>
            <div className="space-y-2 text-[12px] border-t border-[#3D302A] pt-4 text-[#C4B9A1]">
              <div className="flex justify-between">
                <span>Database Engine:</span>
                <strong className="text-white">Cloudflare D1</strong>
              </div>
              <div className="flex justify-between">
                <span>Storage Engine:</span>
                <strong className="text-white">Cloudflare R2</strong>
              </div>
              <div className="flex justify-between">
                <span>App Layer:</span>
                <strong className="text-white">Next.js 16 (App Router)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
