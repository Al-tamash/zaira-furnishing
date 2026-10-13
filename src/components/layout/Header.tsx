'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Sparkles,
  PackageCheck,
  User,
  Ruler,
  Phone,
  Flame,
  Percent,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { useStore } from '@/lib/context/StoreContext';
import { getCategoryHref, getSubcategoryHref } from '@/lib/data/categories';
import { DbCategory, DbSubcategory } from '@/lib/db/types';
import {
  ZAIRA_WHATSAPP_DISPLAY,
  ZAIRA_WHATSAPP_URL,
  buildInquiryBagWhatsAppUrl,
} from '@/lib/whatsapp';
import { ConciergeTopBar } from '@/components/layout/ConciergeTopBar';

interface HeaderCategory extends DbCategory {
  subcategories?: DbSubcategory[];
}

interface HeaderProductResult {
  id: string;
  name: string;
  display_name?: string | null;
  slug: string;
  starting_price?: number | null;
  base_price?: number | null;
  currency?: string | null;
  category_name?: string | null;
  images?: string | string[];
}

export function Header() {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeNavMenu, setActiveNavMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    cart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    wishlistCount,
    openBookingModal,
  } = useStore();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setSearchFocused(false);
    setActiveNavMenu(null);
    setIsCartOpen(false);
  }

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close search dropdown or mega menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (navBarRef.current && !navBarRef.current.contains(e.target as Node)) {
        setActiveNavMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic D1 categories state
  const [categories, setCategories] = useState<HeaderCategory[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to load categories');
        const json = await res.json();
        if (isMounted && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error('Header categories fetch error:', err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamic D1 search state
  const [searchResults, setSearchResults] = useState<HeaderProductResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const abortController = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`, {
          signal: abortController.signal,
        });
        if (!res.ok) throw new Error('Search request failed');
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setSearchResults(json.data);
        } else {
          setSearchResults([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Header search error:', err);
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [searchQuery]);

  const navCategories = [
    {
      name: 'Curtains',
      href: '/categories/curtains',
      id: 'curtains',
      badge: 'Popular',
      sublinks: [
        { label: '100% Thermal Blackout', href: '/categories/curtains/blackout' },
        { label: 'French Sheer Voiles', href: '/categories/curtains/sheer' },
        { label: 'Luxury Velvet Drapes', href: '/categories/curtains/velvet' },
        { label: 'Belgian Pure Linen', href: '/categories/curtains/linen' },
        { label: 'Custom Made-to-Measure', href: '/#bespoke-studio' },
      ],
    },
    {
      name: 'Blinds',
      href: '/categories/blinds',
      id: 'blinds',
      badge: 'Motorized',
      sublinks: [
        { label: 'Motorized Somfy Smart Blinds', href: '/categories/blinds/motorized-smart' },
        { label: 'Architectural Roller Blinds', href: '/categories/blinds/roller' },
        { label: 'Zebra (Day & Night) Blinds', href: '/categories/blinds/zebra' },
        { label: 'Basswood Wooden Venetian', href: '/categories/blinds/wooden' },
        { label: 'Honeycomb & Roman Blinds', href: '/categories/blinds' },
      ],
    },
    {
      name: 'Sofa Fabrics',
      href: '/categories/sofa-fabrics',
      id: 'sofa-fabrics',
      sublinks: [
        { label: 'Italian Textured Bouclé', href: '/categories/sofa-fabrics/boucle' },
        { label: 'Heavy Chenille & Velvet', href: '/categories/sofa-fabrics/velvet-chenille' },
        { label: 'Stain-Resistant Performance', href: '/categories/sofa-fabrics/performance' },
        { label: 'Natural Cotton Linen', href: '/categories/sofa-fabrics/linen-cotton' },
      ],
    },
    {
      name: 'Wallpapers',
      href: '/categories/wallpapers',
      id: 'wallpapers',
      sublinks: [
        { label: 'Handwoven Grasscloth', href: '/categories/wallpapers/textured-grasscloth' },
        { label: 'Scenic Panoramic Murals', href: '/categories/wallpapers/panoramic-murals' },
        { label: 'Textured Fabric Coverings', href: '/categories/wallpapers' },
      ],
    },
    {
      name: 'Mattresses',
      href: '/categories/mattresses-sleep-systems',
      id: 'mattresses',
      sublinks: [
        { label: 'Zero-Motion Pocket Springs', href: '/categories/mattresses-sleep-systems' },
        { label: '100% Organic Natural Latex', href: '/categories/mattresses-sleep-systems' },
        { label: 'Orthopedic Spine Support', href: '/categories/mattresses-sleep-systems' },
      ],
    },
    {
      name: 'Flooring',
      href: '/categories/wooden-flooring-sports-floor',
      id: 'flooring',
      sublinks: [
        { label: 'European Oak Parquet', href: '/categories/wooden-flooring-sports-floor' },
        { label: 'Luxury Herringbone Wood', href: '/categories/wooden-flooring-sports-floor' },
        { label: 'SPC Waterproof Vinyl Flooring', href: '/categories/wooden-flooring-sports-floor' },
      ],
    },
    {
      name: 'Rugs & Carpets',
      href: '/categories/carpets',
      id: 'rugs',
      sublinks: [
        { label: 'Hand-Tufted Wool & Silk', href: '/categories/carpets/hand-tufted' },
        { label: 'Custom Luxury Area Rugs', href: '/categories/carpets' },
      ],
    },
    {
      name: 'Bed & Bath',
      href: '/categories/bed-linen-bath',
      id: 'bed-bath',
      sublinks: [
        { label: '1000 TC Egyptian Bed Linen', href: '/categories/bed-linen-bath' },
        { label: 'Plush Micro-Cotton Towels', href: '/categories/bed-linen-bath' },
      ],
    },
    {
      name: 'Cushions',
      href: '/categories/cushions-pillows',
      id: 'cushions',
      sublinks: [
        { label: 'Embroidered Velvet Pillows', href: '/categories/cushions-pillows' },
        { label: 'Handloom Cotton Covers', href: '/categories/cushions-pillows' },
      ],
    },
  ];

  return (
    <>
      {/* ─── Top Concierge & Flagship Announcement Strip ─── */}
      <ConciergeTopBar />

      {/* ─── E-COMMERCE MAIN HEADER (Zaira Furnishings Tuscan Terracotta & Espresso Theme) ─── */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 bg-[#2C221E] text-white shadow-md border-b border-[#3D302A] ${isScrolled ? 'shadow-xl' : 'shadow-md'
          }`}
      >
        {/* ROW 1: Social Icons (Left) + Signature Gold Logo Plaque (Center) + Phone Hotline, Search & Cart (Right) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-1.5 sm:gap-6">

            {/* LEFT: Social Media Icons & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 -ml-1 text-white hover:text-[#FDE68A] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Social Media Links */}
              <div className="hidden sm:flex items-center gap-3 text-white/90">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-all hover:scale-110 p-1"
                  aria-label="Facebook"
                  title="Follow Zaira on Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-all hover:scale-110 p-1"
                  aria-label="Instagram"
                  title="Follow Zaira on Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={ZAIRA_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] hover:text-[#22c55e] transition-all hover:scale-110 p-1 flex items-center gap-1.5"
                  aria-label="WhatsApp"
                  title="Chat with Zaira on WhatsApp"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.77.813 2.796.814 3.18 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.767-5.768-5.767zm3.385 8.188c-.14.394-.713.729-1.002.766-.279.035-.635.055-1.834-.442-1.444-.598-2.378-2.062-2.45-2.158-.071-.096-.583-.775-.583-1.479 0-.704.368-1.05.5-1.193.132-.143.288-.179.384-.179.096 0 .192.001.276.005.09.004.21.034.32.298.114.275.39 1.05.424 1.127.034.077.057.167.006.269-.051.102-.077.165-.153.254-.076.089-.16.198-.229.266-.077.076-.157.159-.068.312.09.153.399.658.857 1.066.589.524 1.085.687 1.239.764.153.077.243.064.333-.039.09-.102.385-.448.487-.602.102-.154.204-.128.344-.077.14.051.888.419 1.041.496.153.076.255.115.293.179.038.064.038.371-.102.765z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* CENTER: Signature Atelier Brand Identity */}
            <Link href="/" className="shrink min-w-0 flex flex-col items-center group cursor-pointer text-center py-0.5">
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Gold Monogram Jewel */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#C5A059] to-[#9A7B56] text-[#1C1714] flex items-center justify-center font-serif text-[15px] sm:text-[17px] font-black shadow-md border border-[#F3E2B3]/60 group-hover:scale-105 transition-transform">
                  Z
                </div>
                <div className="flex flex-col text-left leading-none min-w-0">
                  <span className="font-serif font-black text-[17px] sm:text-[23px] tracking-[0.12em] sm:tracking-[0.14em] text-white uppercase leading-none group-hover:text-[#D4AF37] transition-colors truncate">
                    ZAIRA
                  </span>
                  <span className="text-[6.5px] sm:text-[8.5px] font-bold tracking-[0.2em] sm:tracking-[0.32em] text-[#D4AF37] uppercase leading-none mt-1 truncate">
                    FURNISHING &bull; HYDERABAD
                  </span>
                </div>
              </div>
            </Link>

            {/* RIGHT: Search Icon + Wishlist & Shopping Bag */}
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">

              {/* Search Toggle Icon */}
              <button
                type="button"
                onClick={() => setSearchFocused(!searchFocused)}
                className="p-1.5 sm:p-2 text-white hover:text-[#D4AF37] transition-all hover:scale-110 cursor-pointer rounded-full hover:bg-white/5"
                aria-label="Search store products"
                title="Search Products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </button>

              {/* Wishlist Link with Badge */}
              <Link
                href="/account"
                className="relative p-1.5 sm:p-2 text-white hover:text-[#D4AF37] transition-all hover:scale-110 rounded-full hover:bg-white/5"
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[15px] h-[15px] sm:min-w-[17px] sm:h-[17px] px-1 text-[8px] sm:text-[9.5px] font-bold text-white bg-[#9E4733] rounded-full flex items-center justify-center shadow-xs border border-[#2C221E]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Bag */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 sm:p-2 text-white hover:text-[#D4AF37] transition-all hover:scale-110 cursor-pointer rounded-full hover:bg-white/5"
                aria-label="Shopping Cart"
                title="View Bag"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[15px] h-[15px] sm:min-w-[17px] sm:h-[17px] px-1 text-[8px] sm:text-[9.5px] font-bold text-white bg-[#9E4733] rounded-full flex items-center justify-center shadow-xs border border-[#2C221E]">
                    {cartCount}
                  </span>
                )}
              </button>

            </div>
          </div>

          {/* Expandable Instant Search Bar (Opens when Search icon is clicked) */}
          {searchFocused && (
            <div ref={searchContainerRef} className="mt-3 relative z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="w-full flex items-center border-2 border-[#D4AF37] rounded-xl overflow-hidden bg-white text-gray-900 shadow-2xl">
                <div className="pl-4 pr-2 text-[#9E4733]">
                  <Search className="w-4 h-4 text-[#9E4733]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search curtains, blinds, sofa fabrics, wallpapers, rugs, mattresses..."
                  autoFocus
                  className="w-full py-2.5 text-[13.5px] text-gray-900 placeholder-gray-500 bg-transparent focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchFocused(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] uppercase tracking-wider transition-colors shrink-0"
                >
                  Close
                </button>
              </div>

              {/* Instant Search Results Dropdown */}
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#E7E2D6] p-4 text-gray-900 z-50">
                {isSearching ? (
                  <div className="py-6 text-center text-[13px] text-gray-500">
                    <p className="font-semibold text-[#9E4733]">Searching store catalog...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100 text-[11px] uppercase tracking-wider text-[#9E4733] font-bold">
                      <span>Matching Furnishings ({searchResults.length})</span>
                      <Link href="/categories" onClick={() => setSearchFocused(false)} className="text-[#9E4733] hover:underline">
                        View All
                      </Link>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={() => setSearchFocused(false)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F6F1E9] transition-colors border border-transparent hover:border-[#E7E2D6]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F6F1E9] border border-[#E7E2D6] flex items-center justify-center text-[#9E4733]">
                              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                                {item.display_name || item.name}
                              </p>
                              <p className="text-[11px] text-gray-500">{item.category_name || 'Furnishing'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-medium text-[#9E4733] uppercase tracking-wider">
                              View Design &rarr;
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery ? (
                  <div className="py-4 text-center text-[13px] text-gray-600">
                    No products found for &ldquo;{searchQuery}&rdquo;. Try browsing popular categories below.
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Blackout Curtains', 'Motorized Blinds', 'Bouclé Sofa Fabric', 'Natural Latex Mattress', 'Grasscloth Wallpaper', 'Oak Flooring', 'Carpets & Rugs'].map(
                        (tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1 bg-[#F6F1E9] hover:bg-[#9E4733] hover:text-white text-gray-700 text-[11.5px] rounded-full border border-gray-200 transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: ZAIRA CLEAN CATEGORY & SERVICE NAVIGATION BAR */}
        <div ref={navBarRef} className="hidden lg:block bg-[#1E1714] border-t border-[#3D302A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between py-2 text-[12px] xl:text-[13px] font-medium tracking-normal text-white/90">

              <div className="flex items-center gap-6 xl:gap-8 overflow-x-auto no-scrollbar">
                {/* 1. Explore All Collections ⌵ Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setActiveNavMenu('explore')}
                  onMouseLeave={() => setActiveNavMenu(null)}
                >
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap font-bold text-[#F3E2B3]"
                  >
                    <span>Explore All</span>
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform opacity-75" />
                  </Link>

                  {/* Dropdown with Zaira's 9 Categories */}
                  {activeNavMenu === 'explore' && (
                    <div className="absolute top-full left-0 w-64 bg-white rounded-b-xl shadow-2xl border border-gray-200 py-2.5 z-50 text-gray-900 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-4 pb-2 mb-1 border-b border-gray-100 text-[10.5px] font-bold uppercase tracking-wider text-[#9E4733]">
                        Product Categories
                      </div>
                      {navCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.href}
                          onClick={() => setActiveNavMenu(null)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#F6F1E9] hover:text-[#9E4733] transition-colors text-[13px] font-medium"
                        >
                          <span>{cat.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Curtains */}
                <Link
                  href="/categories/curtains"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Window Curtains
                </Link>

                {/* 3. Blinds */}
                <Link
                  href="/categories/blinds"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Window Blinds
                </Link>

                {/* 4. Sofa Fabrics */}
                <Link
                  href="/categories/sofa-fabrics"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Sofa Fabrics
                </Link>

                {/* 5. Wallpapers */}
                <Link
                  href="/categories/wallpapers"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Wallpapers
                </Link>

                {/* 6. Mattresses */}
                <Link
                  href="/categories/mattresses-sleep-systems"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Mattresses
                </Link>

                {/* 7. Wooden Flooring */}
                <Link
                  href="/categories/wooden-flooring-sports-floor"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Wooden Flooring
                </Link>

                {/* 8. Carpets & Rugs */}
                <Link
                  href="/categories/carpets"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Carpets &amp; Rugs
                </Link>

                {/* 9. Bed Linen */}
                <Link
                  href="/categories/bed-linen-bath"
                  className="text-white/85 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer whitespace-nowrap"
                >
                  Bed Linen
                </Link>
              </div>

              {/* 10. Book Free Measurement Action Button */}
              <div className="flex items-center pl-4 shrink-0">
                <button
                  type="button"
                  onClick={() => openBookingModal('Free Doorstep In-Home Measurement')}
                  className="px-3.5 py-1.5 rounded-full bg-[#D4AF37] hover:bg-[#E5C378] text-[#1E1714] font-semibold text-[11.5px] tracking-wide transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95"
                >
                  Book Free Home Visit
                </button>
              </div>

            </nav>
          </div>
        </div>
      </header>

      {/* ─── Mobile Slide-Over Menu (Ultra-Luxury Atelier Drawer) ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
            className="fixed inset-y-0 left-0 w-[88vw] max-w-sm bg-[#FAF8F5] shadow-2xl z-50 flex flex-col justify-between p-5 sm:p-6 border-r border-[#EAE4D8] overflow-y-auto animate-in slide-in-from-left duration-300"
          >
            <div>
              {/* Header with Monogram Crest */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE4D8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2C221E] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-black border border-[#D4AF37]/40 shadow-xs">
                    Z
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-[17px] tracking-wider text-[#2C221E] font-bold leading-tight uppercase">
                      ZAIRA FURNISHING
                    </span>
                    <span className="text-[8.5px] uppercase tracking-[0.24em] text-[#9A7B56] font-bold mt-0.5">
                      Puppalguda · Hyderabad
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1C1917] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Contact Bar for Mobile Users */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <a
                  href={`tel:${ZAIRA_WHATSAPP_DISPLAY.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-[#EAE4D8] text-[#1C1714] text-[11px] font-bold uppercase tracking-wider shadow-2xs hover:border-[#9A7B56] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#9A7B56]" />
                  <span>Call Us</span>
                </a>
                <a
                  href={ZAIRA_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] text-white text-[11px] font-bold uppercase tracking-wider shadow-2xs hover:bg-[#20BA5C] transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.97.53 1.77.813 2.796.814 3.18 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.767-5.768-5.767zm3.385 8.188c-.14.394-.713.729-1.002.766-.279.035-.635.055-1.834-.442-1.444-.598-2.378-2.062-2.45-2.158-.071-.096-.583-.775-.583-1.479 0-.704.368-1.05.5-1.193.132-.143.288-.179.384-.179.096 0 .192.001.276.005.09.004.21.034.32.298.114.275.39 1.05.424 1.127.034.077.057.167.006.269-.051.102-.077.165-.153.254-.076.089-.16.198-.229.266-.077.076-.157.159-.068.312.09.153.399.658.857 1.066.589.524 1.085.687 1.239.764.153.077.243.064.333-.039.09-.102.385-.448.487-.602.102-.154.204-.128.344-.077.14.051.888.419 1.041.496.153.076.255.115.293.179.038.064.038.371-.102.765z" />
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Navigation Links */}
              <div className="py-2 flex flex-col space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] uppercase tracking-[0.14em] font-semibold text-[#1C1917] hover:text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between"
                >
                  <span>Home</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                </Link>

                <Link
                  href="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] uppercase tracking-[0.14em] font-bold text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>All Collections (9 Categories)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#823423]" />
                </Link>

                {categories.slice(0, 7).map((cat) => (
                  <Link
                    key={cat.id}
                    href={getCategoryHref(cat.slug)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[13px] uppercase tracking-[0.14em] font-medium text-[#1C1917] hover:text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between pl-2"
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3 h-3 text-[#C4B9A1]" />
                  </Link>
                ))}

                <Link
                  href="/services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] uppercase tracking-[0.14em] font-semibold text-[#1C1917] hover:text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between"
                >
                  <span>Fitting &amp; Services</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] uppercase tracking-[0.14em] font-semibold text-[#1C1917] hover:text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between"
                >
                  <span>About Zaira</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8A29E]" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[13px] uppercase tracking-[0.14em] font-semibold text-[#823423] py-2.5 border-b border-[#F2ECE1] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#823423]" />
                    <span>Showroom &amp; Contact</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#823423]" />
                </Link>
              </div>

              {/* Consultation Callout */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE4D8] mt-4 mb-3 shadow-2xs">
                <div className="flex items-center gap-1.5 mb-1 text-[#823423]">
                  <Ruler className="w-4 h-4 text-[#D4AF37]" />
                  <p className="text-[12px] font-bold uppercase tracking-wider">
                    Free In-Home Measurement
                  </p>
                </div>
                <p className="text-[11px] text-[#78716C] leading-relaxed mb-3">
                  Laser precision window measuring &amp; 500+ fabric swatches at your doorstep across Hyderabad.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBookingModal('Free In-Home Measurement');
                  }}
                  className="block w-full py-2.5 text-center text-[11px] uppercase tracking-wider font-bold bg-[#1C1714] hover:bg-[#2C221E] text-white rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Book Free Visit
                </button>
              </div>
            </div>

            {/* Showroom Details */}
            <div className="pt-3 border-t border-[#EAE4D8] text-[11px] text-[#78716C] space-y-0.5">
              <p className="font-semibold text-[#1C1917]">Puppalguda &amp; Financial District</p>
              <p className="text-[#8C827A]">Alkapur Twp, Hyderabad 500089</p>
              <div className="pt-1">
                <a
                  href={ZAIRA_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Zaira Furnishing on WhatsApp"
                  className="inline-flex items-center gap-1 font-semibold text-[#823423] hover:underline"
                >
                  <span>Concierge Hotline:</span>
                  <span>{ZAIRA_WHATSAPP_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Global Slide-Over Shopping Cart Drawer ─── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
            className="relative w-full max-w-md bg-[#FDFBF7] shadow-2xl z-50 flex flex-col justify-between p-4 sm:p-6 border-l border-[#EAE4D8] overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE4D8]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#2C221E]" />
                  <span className="font-serif text-[17px] sm:text-[18px] text-[#1C1917] font-medium">
                    Your Shortlist ({cartCount})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-black/5 cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {cart.length > 0 ? (
                <div className="mt-4 sm:mt-5 space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#EAE4D8] flex gap-3 shadow-2xs"
                    >
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EAE4D8]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-serif text-[13.5px] sm:text-[14px] font-medium text-[#1C1917] truncate">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#A8A29E] hover:text-rose-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.variantName && (
                            <p className="text-[11.5px] text-[#9A7B56] font-medium">
                              {item.variantName}
                            </p>
                          )}
                          {item.sizeLabel && (
                            <p className="text-[11px] text-[#78716C]">
                              Size: {item.sizeLabel}
                            </p>
                          )}
                          {item.headingStyle && (
                            <p className="text-[10.5px] text-[#8C827A]">
                              Heading: {item.headingStyle}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F2ECE1]">
                          <div className="inline-flex items-center border border-[#EAE4D8] rounded-md bg-[#FAF7F2] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-[#57534E] hover:bg-white text-[12px] active:bg-neutral-200"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-[12px] font-semibold text-[#1C1917]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#57534E] hover:bg-white text-[12px] active:bg-neutral-200"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[11px] font-semibold text-[#823423] uppercase tracking-wider">
                            Custom Quote
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-[#78716C]">
                  <ShoppingBag className="w-10 h-10 mx-auto text-[#C4B9A1] stroke-[1.25] mb-3" />
                  <p className="font-serif text-[16px] text-[#1C1917] font-medium mb-1">
                    Your shortlist is empty
                  </p>
                  <p className="text-[12px] max-w-xs mx-auto">
                    Explore our collections to save designs or book a free in-home measurement.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#EAE4D8] space-y-2 mt-6">
              {cart.length > 0 && (
                <div className="flex justify-between items-center text-[12.5px] font-medium text-[#78716C] mb-2">
                  <span>Selected Designs</span>
                  <span className="font-semibold text-[#1C1917]">
                    {cartCount} {cartCount === 1 ? 'Design' : 'Designs'}
                  </span>
                </div>
              )}

              {cart.length > 0 ? (
                <div className="space-y-2.5">
                  {/* Primary Action: Send Shortlist to WhatsApp */}
                  <a
                    href={buildInquiryBagWhatsAppUrl(cart, 0)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-3.5 rounded-xl text-center text-[12px] uppercase tracking-wider font-bold bg-[#1C1714] text-white hover:bg-[#2C221E] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                    <span>Send Shortlist to WhatsApp</span>
                  </a>

                  {/* Secondary Action: Book Visit */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      openBookingModal('Free Measurement for Shortlisted Items');
                    }}
                    className="block w-full py-2.5 rounded-xl text-center text-[11.5px] uppercase tracking-wider font-semibold border border-[#D5CCBA] text-[#1C1714] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    Book Free Measurement
                  </button>
                </div>
              ) : (
                <Link
                  href="/categories"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-3 text-center text-[12px] uppercase tracking-widest font-medium bg-[#1C1714] text-white hover:bg-[#9A7B56] rounded-xl transition-colors"
                >
                  Browse Categories
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-2.5 text-center text-[11px] uppercase tracking-wider font-medium text-[#78716C] hover:text-[#1C1917]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
