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
  Ruler,
  FileQuestion,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface AdminStats {
  ordersCount: number;
  productsCount: number;
  activeProductsCount: number;
  categoriesCount: number;
  quotesCount: number;
  newQuotesCount: number;
  measCount: number;
  newMeasCount: number;
  inquiriesCount: number;
  newInquiriesCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentMeasurements, setRecentMeasurements] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'measurements' | 'quotes' | 'products'>('measurements');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, catsRes, prodsRes, quotesRes, measRes, inqRes] = await Promise.all([
        fetch('/api/admin/orders?limit=1').catch(() => null),
        fetch('/api/admin/categories').catch(() => null),
        fetch('/api/admin/products').catch(() => null),
        fetch('/api/quote-requests?limit=6').catch(() => null),
        fetch('/api/measurement-requests?limit=6').catch(() => null),
        fetch('/api/contact?limit=1').catch(() => null),
      ]);

      const ordersData = ordersRes?.ok ? await ordersRes.json() : { total: 0 };
      const catsData = catsRes?.ok ? await catsRes.json() : { data: [] };
      const prodsData = prodsRes?.ok ? await prodsRes.json() : { data: [] };
      const quotesData = quotesRes?.ok ? await quotesRes.json() : { requests: [], total: 0, counts: {} };
      const measData = measRes?.ok ? await measRes.json() : { requests: [], total: 0, counts: {} };
      const inqData = inqRes?.ok ? await inqRes.json() : { total: 0 };

      const prods = prodsData.data || [];
      const cats = catsData.data || [];

      setStats({
        ordersCount: ordersData.total || 0,
        productsCount: prods.length,
        activeProductsCount: prods.filter((p: { active: number }) => p.active === 1).length,
        categoriesCount: cats.length,
        quotesCount: quotesData.total || 0,
        newQuotesCount: quotesData.counts?.new || 0,
        measCount: measData.total || 0,
        newMeasCount: measData.counts?.new || 0,
        inquiriesCount: inqData.total || 0,
        newInquiriesCount: inqData.total || 0,
      });

      setRecentMeasurements(measData.requests || []);
      setRecentQuotes(quotesData.requests || []);
      setRecentProducts(prods.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ─── Page Title Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EDE8DE] shadow-2xs">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#9A7B56] block mb-1">
            Flagship Showroom Operations Console
          </span>
          <h1 className="font-serif text-[26px] sm:text-[32px] text-[#1C1917] font-medium tracking-tight">
            Showroom Operations & Inquiries
          </h1>
          <p className="text-[13.5px] text-[#78716C] mt-1">
            Track in-home laser measurements, bespoke quotes, live customer inquiries, and catalog inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#D5CDBF] text-[#1C1917] text-[12.5px] font-medium hover:border-[#1C1917] transition-all bg-white cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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

      {/* ─── Metric Cards Grid (Business KPIs) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Measurement Requests */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Site Measurements
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
                {loading ? '—' : stats?.measCount}
              </span>
              {Boolean(stats?.newMeasCount) && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                  {stats?.newMeasCount} New
                </span>
              )}
            </div>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Home laser visits & consultations</span>
            </div>
          </div>
          <Link
            href="/admin/measurement-requests"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>View Measurement Schedule</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 2. Bespoke Quotes */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Bespoke Quotes
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#9A7B56]/15 flex items-center justify-center text-[#9A7B56]">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
                {loading ? '—' : stats?.quotesCount}
              </span>
              {Boolean(stats?.newQuotesCount) && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-200 text-stone-800">
                  {stats?.newQuotesCount} Pending
                </span>
              )}
            </div>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Curtains, blinds & fabric estimates</span>
            </div>
          </div>
          <Link
            href="/admin/quote-requests"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Review Quote Requests</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 3. Customer Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Customer Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.ordersCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Direct WhatsApp & web orders</span>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 4. Active Catalog Products */}
        <div className="bg-white p-5 rounded-2xl border border-[#EDE8DE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C827A]">
              Active Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#2C221E]/10 flex items-center justify-center text-[#2C221E]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-[32px] font-bold text-[#1C1917] tracking-tight">
              {loading ? '—' : stats?.activeProductsCount}
            </span>
            <div className="text-[11.5px] text-[#78716C] mt-0.5">
              <span>Across {stats?.categoriesCount || 12} curated categories</span>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] mt-4 transition-colors"
          >
            <span>Explore Product Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ─── Operational Feed & Quick Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed with Tabbed Views */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#F2ECE1]">
            <div>
              <h2 className="font-serif text-[19px] text-[#1C1917] font-medium">
                Client Consultations & Requests
              </h2>
              <span className="text-[12px] text-[#78716C]">
                Real-time inquiries awaiting showroom response
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#EDE8DE]">
              <button
                onClick={() => setActiveTab('measurements')}
                className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'measurements'
                    ? 'bg-[#2C221E] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Measurements ({recentMeasurements.length})
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-[#2C221E] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Quotes ({recentQuotes.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-[#2C221E] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Catalog ({recentProducts.length})
              </button>
            </div>
          </div>

          {/* TAB 1: Measurements */}
          {activeTab === 'measurements' && (
            <div className="divide-y divide-[#F2ECE1]">
              {recentMeasurements.length === 0 ? (
                <div className="py-12 text-center text-[#78716C] text-[13px]">
                  No measurement requests found.
                </div>
              ) : (
                recentMeasurements.map((m) => {
                  const cleanPhone = (m.customer_phone || '').replace(/\D/g, '');
                  return (
                    <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 px-2 rounded-xl transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#9A7B56]">
                            {m.request_number}
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#1C1917]">
                            {m.customer_name}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11.5px] text-[#78716C] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#A8A29E]" />
                            <span className="truncate max-w-[200px]">{m.address || 'Address provided on call'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#A8A29E]" />
                            <span>{m.preferred_date || 'Earliest Slot'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                              `Hello ${m.customer_name}, regarding your Zaira Furnishing measurement visit (${m.request_number})...`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <Link
                          href={`/admin/measurement-requests/${m.id}`}
                          className="px-3 py-1.5 rounded-lg border border-[#EDE8DE] hover:border-[#2C221E] text-[11.5px] font-medium text-[#1C1917] transition-all bg-white"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="pt-4 text-center">
                <Link
                  href="/admin/measurement-requests"
                  className="text-[12.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] inline-flex items-center gap-1"
                >
                  <span>View All Measurement Bookings ({stats?.measCount || 0})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: Quotes */}
          {activeTab === 'quotes' && (
            <div className="divide-y divide-[#F2ECE1]">
              {recentQuotes.length === 0 ? (
                <div className="py-12 text-center text-[#78716C] text-[13px]">
                  No quote requests found.
                </div>
              ) : (
                recentQuotes.map((q) => {
                  const cleanPhone = (q.customer_phone || '').replace(/\D/g, '');
                  return (
                    <div key={q.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 px-2 rounded-xl transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#9A7B56]">
                            {q.request_number}
                          </span>
                          <span className="text-[13.5px] font-semibold text-[#1C1917]">
                            {q.customer_name}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                            {q.status}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-[#78716C] mt-1 line-clamp-1">
                          Product: <span className="font-medium text-[#1C1917]">{q.product_name || 'Custom Consultation'}</span>
                          {q.quantity && ` · Qty: ${q.quantity}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(
                              `Hello ${q.customer_name}, regarding your quotation request (${q.request_number}) with Zaira Furnishing...`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <Link
                          href={`/admin/quote-requests/${q.id}`}
                          className="px-3 py-1.5 rounded-lg border border-[#EDE8DE] hover:border-[#2C221E] text-[11.5px] font-medium text-[#1C1917] transition-all bg-white"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
              <div className="pt-4 text-center">
                <Link
                  href="/admin/quote-requests"
                  className="text-[12.5px] font-semibold text-[#2C221E] hover:text-[#9A7B56] inline-flex items-center gap-1"
                >
                  <span>View All Quote Requests ({stats?.quotesCount || 0})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: Products */}
          {activeTab === 'products' && (
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
          )}
        </div>

        {/* Operational Actions & Showroom Context */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Operations Panel */}
          <div className="bg-[#2C221E] text-white p-6 rounded-2xl border border-[#3D302A] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#9A7B56]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C4B9A1]">
                Quick Showroom Actions
              </span>
            </div>
            <h3 className="font-serif text-[18px] font-medium mb-2">
              Showroom Operations
            </h3>
            <p className="text-[12.5px] text-[#A8A29E] leading-relaxed mb-4 font-light">
              Direct shortcuts for daily showroom appointments, customer inquiries, and catalog management.
            </p>
            <div className="space-y-2 border-t border-[#3D302A] pt-4">
              <Link
                href="/admin/inquiries"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12.5px] text-[#FAF7F2] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#C5A059]" />
                  <span>Contact Inquiries</span>
                </div>
                <span className="text-[11px] text-[#A8A29E]">{stats?.inquiriesCount || 0} →</span>
              </Link>

              <Link
                href="/admin/services"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12.5px] text-[#FAF7F2] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-[#C5A059]" />
                  <span>Manage Services</span>
                </div>
                <span className="text-[11px] text-[#A8A29E]">12 Services →</span>
              </Link>

              <Link
                href="/admin/cms"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[12.5px] text-[#FAF7F2] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#C5A059]" />
                  <span>Homepage CMS Editor</span>
                </div>
                <span className="text-[11px] text-[#A8A29E]">Hero & Showroom →</span>
              </Link>
            </div>
          </div>

          {/* Showroom Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-[#EDE8DE] shadow-2xs space-y-3">
            <h4 className="font-serif text-[16px] font-semibold text-[#1C1917]">
              Puppalguda Showroom Location
            </h4>
            <div className="text-[12.5px] text-[#78716C] space-y-1.5 leading-relaxed">
              <p className="font-medium text-[#1C1917]">Puppalguda & Financial District</p>
              <p>Hyderabad, Telangana 500089</p>
              <p>Consultation Hours: Mon – Sun, 10:00 AM – 9:00 PM</p>
            </div>
            <div className="pt-2">
              <Link
                href="/contact"
                target="_blank"
                className="text-[11.5px] font-semibold text-[#9A7B56] hover:text-[#7A5832] inline-flex items-center gap-1"
              >
                <span>View Public Contact Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
