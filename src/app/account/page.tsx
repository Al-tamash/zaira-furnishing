'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  Lock,
  Heart,
  ShoppingBag,
  PackageCheck,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useStore, CartItem } from '@/lib/context/StoreContext';

export default function AccountPage() {
  const {
    customer,
    isAuthenticated,
    isAuthLoading,
    refreshSession,
    logout,
    wishlist,
    toggleWishlist,
    cart,
    cartCount,
    cartTotal,
    addToCart,
    orders,
  } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Wishlist items state from D1
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const fetchWishlistProducts = async () => {
    if (!isAuthenticated) return;
    setLoadingWishlist(true);
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setWishlistProducts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistProducts();
    }
  }, [isAuthenticated, wishlist]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to sign in');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to register account');
        }
      }

      await refreshSession();
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setWishlistProducts([]);
  };

  if (isAuthLoading) {
    return (
      <div className="bg-[#FAF7F2] min-h-screen pt-12 pb-24 text-[#1C1917]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#2C221E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-[#78716C]">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F2] min-h-screen pt-6 sm:pt-10 pb-16 sm:pb-24 text-[#1C1917]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-1.5 text-[11.5px] sm:text-[12px] text-[#78716C] mb-6 sm:mb-8 font-normal">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
          <span className="text-[#1C1917] font-semibold">Customer Account</span>
        </nav>

        {!isAuthenticated ? (
          /* ─── UNAUTHENTICATED: LOGIN / REGISTER PORTAL ─── */
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#EDE8DE] p-6 sm:p-10 shadow-[0_4px_24px_rgba(28,25,23,0.04)]">
            <div className="text-center mb-6">
              <span className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9A7B56] font-semibold block mb-1.5">
                Client Atelier
              </span>
              <h1 className="font-serif text-[28px] sm:text-[32px] text-[#1C1917] font-medium tracking-tight mb-2">
                {authMode === 'login' ? 'Sign In to Your Account' : 'Create an Account'}
              </h1>
              <p className="text-[13px] text-[#78716C] leading-relaxed">
                {authMode === 'login'
                  ? 'Access your synchronized database cart, bespoke orders, and curated wishlist.'
                  : 'Register to save custom measurements, fabric selections, and order history.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#FAF7F2] p-1 border border-[#EAE4D8] mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#2C221E] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#2C221E] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] leading-relaxed">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohini Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-[#FAF7F2] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@zairafurnishing.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-[#FAF7F2] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-[#FAF7F2] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-[#FAF7F2] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1C1917] mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D8CFBF] bg-[#FAF7F2] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-center text-[12px] uppercase tracking-widest font-semibold bg-[#1C1714] hover:bg-[#2C221E] text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading
                  ? 'Connecting...'
                  : authMode === 'login'
                    ? 'Sign In to Account'
                    : 'Create Customer Account'}
              </button>
            </form>
          </div>
        ) : (
          /* ─── AUTHENTICATED CUSTOMER DASHBOARD ─── */
          <div>
            {/* Top Customer Greeting Banner */}
            <div className="bg-white rounded-3xl border border-[#EDE8DE] p-6 sm:p-8 mb-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#2C221E]/10 text-[#2C221E] flex items-center justify-center font-serif text-[24px] sm:text-[28px] font-medium shrink-0">
                  {customer?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-serif text-[24px] sm:text-[28px] text-[#1C1917] font-medium leading-tight">
                      {customer?.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBF8F3] text-[#7A5832] border-[#E8DFC8]">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Customer
                    </span>
                  </div>
                  <p className="text-[13px] text-[#78716C] flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>{customer?.email}</span>
                    {customer?.phone && (
                      <>
                        <span>•</span>
                        <span>{customer.phone}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE8DE] hover:border-[#2C221E] text-[12.5px] font-medium text-[#1C1917] transition-all bg-[#FAF7F2]"
                >
                  <PackageCheck className="w-4 h-4 text-[#9A7B56]" />
                  <span>My Orders</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12.5px] font-medium transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Wishlist Card */}
              <button
                type="button"
                onClick={() => setActiveTab('wishlist')}
                className={`text-left p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-white border-[#2C221E] shadow-sm ring-1 ring-[#2C221E]'
                    : 'bg-white border-[#EDE8DE] hover:border-[#2C221E]/50 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#9A7B56] font-semibold">
                    Saved Items
                  </span>
                  <Heart className="w-5 h-5 text-[#9A7B56]" />
                </div>
                <div className="font-serif text-[28px] text-[#1C1917] font-medium mb-1">
                  {wishlistProducts.length}
                </div>
                <p className="text-[12px] text-[#78716C]">View your D1-synced wishlist</p>
              </button>

              {/* Cart Card */}
              <Link
                href="/cart"
                className="p-6 rounded-2xl bg-white border border-[#EDE8DE] hover:border-[#2C221E]/50 transition-all shadow-2xs block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#2C221E] font-semibold">
                    Active Cart
                  </span>
                  <ShoppingBag className="w-5 h-5 text-[#2C221E]" />
                </div>
                <div className="font-serif text-[28px] text-[#1C1917] font-medium mb-1">
                  {cartCount} items
                </div>
                <p className="text-[12px] text-[#78716C]">Total: ₹{cartTotal.toLocaleString('en-IN')}</p>
              </Link>

              {/* Orders Card */}
              <Link
                href="/account/orders"
                className="p-6 rounded-2xl bg-white border border-[#EDE8DE] hover:border-[#2C221E]/50 transition-all shadow-2xs block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold">
                    Order Tracking
                  </span>
                  <PackageCheck className="w-5 h-5 text-[#78716C]" />
                </div>
                <div className="font-serif text-[28px] text-[#1C1917] font-medium mb-1">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </div>
                <p className="text-[12px] text-[#78716C]">View order details & status</p>
              </Link>
            </div>

            {/* ─── TAB CONTENT: WISHLIST VIEW ─── */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl border border-[#EDE8DE] p-6 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
                <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1] mb-6">
                  <div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] text-[#1C1917] font-medium">
                      Your Saved Furnishings ({wishlistProducts.length})
                    </h2>
                    <p className="text-[12.5px] text-[#78716C]">
                      These products are stored directly in your Cloudflare D1 account wishlist.
                    </p>
                  </div>
                  <Link
                    href="/categories"
                    className="text-[11.5px] uppercase tracking-wider font-semibold text-[#2C221E] hover:underline"
                  >
                    Browse Categories &rarr;
                  </Link>
                </div>

                {loadingWishlist ? (
                  <div className="py-12 text-center text-[#78716C] text-[13px]">
                    Loading wishlist...
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="py-16 text-center max-w-sm mx-auto">
                    <Heart className="w-10 h-10 text-[#C4B9A1] mx-auto mb-3" />
                    <h3 className="font-serif text-[18px] text-[#1C1917] font-medium mb-1">
                      Your wishlist is empty
                    </h3>
                    <p className="text-[13px] text-[#78716C] mb-5">
                      Explore our handcrafted curtains, blinds, and wallpapers to save your favorite selections.
                    </p>
                    <Link
                      href="/categories"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2C221E] text-white text-[12px] font-semibold uppercase tracking-wider hover:bg-[#2C221E] transition-colors"
                    >
                      <span>Explore Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {wishlistProducts.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#EDE8DE] bg-[#FAF7F2] p-4 flex flex-col justify-between group hover:border-[#C4B9A1] transition-all"
                      >
                        <div>
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-white">
                            <Image
                              src={item.main_image || '/images/hero/living_room.jpg'}
                              alt={item.product_name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <Link
                            href={`/products/${item.product_slug}`}
                            className="font-serif text-[16px] text-[#1C1917] font-medium hover:text-[#9A7B56] line-clamp-1 mb-1 block"
                          >
                            {item.product_name}
                          </Link>
                          <div className="text-[14px] font-semibold text-[#1C1917] mb-3">
                            ₹{item.base_price.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#EAE4D8] flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart({
                                productId: item.product_id,
                                name: item.product_name,
                                slug: item.product_slug,
                                image: item.main_image || '/images/hero/living_room.jpg',
                                sku: item.product_slug,
                                quantity: 1,
                                unitPrice: item.base_price,
                              });
                            }}
                            className="flex-1 py-2 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[11.5px] uppercase font-semibold tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleWishlist(item.product_id)}
                            className="p-2 rounded-xl border border-[#EDE8DE] hover:border-red-200 text-[#78716C] hover:text-red-600 transition-colors cursor-pointer"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
