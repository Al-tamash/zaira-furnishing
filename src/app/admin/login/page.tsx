'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('concierge@zairafurnishing.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8">
      {/* ─── Main Two-Column Auth Card ─── */}
      <div className="w-full max-w-[880px] bg-white rounded-2xl border border-[#E8E2D5] shadow-[0_20px_50px_rgba(28,25,23,0.06)] overflow-hidden flex flex-col md:flex-row">
        
        {/* ─── Left Brand Panel (~44%) ─── */}
        <div className="relative md:w-[44%] bg-[#1C1714] p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-[#FAF7F2] overflow-hidden">
          {/* Subtle Atelier Furnishing Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none select-none">
            <Image
              src="/images/about/about-main-living.jpg"
              alt="Zaira Furnishing Atelier"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 44vw"
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1C1714]/92 via-[#2C221E]/95 to-[#12100E]" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 36 36" className="w-5 h-5 fill-none" aria-hidden="true">
                  <path d="M18 3 L31 14 L18 22 L5 14 Z" fill="#9CA488" />
                  <path d="M5 14 L18 22 L18 33 L5 25 Z" fill="#2C221E" />
                  <path d="M31 14 L18 22 L18 33 L31 25 Z" fill="#587465" />
                  <path
                    d="M18 10 L23 14 L23 24 L13 24 L13 14 Z"
                    stroke="#FAF7F2"
                    strokeWidth="1.2"
                    strokeOpacity="0.7"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[18px] sm:text-[20px] tracking-[0.16em] font-semibold text-white uppercase leading-none">
                  ZAIRA
                </span>
                <span className="text-[7.5px] uppercase tracking-[0.3em] text-[#C4B9A1] font-medium mt-1 leading-none">
                  FURNISHING
                </span>
              </div>
            </div>

            <div className="mt-2">
              <span className="inline-block text-[9.5px] uppercase tracking-[0.24em] text-[#C4B9A1] font-medium py-0.5">
                Atelier Management
              </span>
            </div>
          </div>

          {/* Middle/Bottom Supporting Narrative */}
          <div className="relative z-10 mt-6 md:mt-12">
            <div className="w-8 h-px bg-[#9A7B56]/50 mb-4 hidden md:block" />
            <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-[#FAF7F2]/80 font-normal">
              Manage products, orders, services and the Zaira Furnishing experience from one secure workspace.
            </p>
          </div>
        </div>

        {/* ─── Right Login Card (~56%) ─── */}
        <div className="md:w-[56%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div>
              <h1 className="font-serif text-[22px] sm:text-[24px] font-semibold text-[#1C1917] tracking-tight">
                Welcome back
              </h1>
              <p className="text-[13px] text-[#78716C] mt-1">
                Sign in to manage the Zaira Furnishing workspace.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-[12.5px] leading-snug flex items-center gap-2"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Administrator Email */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] focus:ring-1 focus:ring-[#2C221E] transition-all bg-[#FAF7F2]"
                  />
                </div>
              </div>

              {/* Master Password */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#1C1917] mb-1.5"
                >
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter master password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D5CDBF] text-[13.5px] text-[#1C1917] focus:outline-hidden focus:border-[#9A7B56] focus:ring-1 focus:ring-[#2C221E] transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C827A] hover:text-[#1C1917] transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#1C1714] hover:bg-[#2C221E] text-white text-[13.5px] font-medium tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in to Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Indicator */}
          <div className="mt-6 pt-4 border-t border-[#F2ECE1] flex items-center justify-center gap-2 text-[11.5px] text-[#78716C]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A7B56]" />
            <span>Secure administrator access</span>
          </div>
        </div>
      </div>

      {/* ─── Discreet Page Footer ─── */}
      <div className="mt-5 text-center text-[11px] text-[#8C827A] tracking-wide space-y-0.5">
        <p>Zaira Furnishing · Atelier Management</p>
        <p className="text-[10px] text-[#A8A29E]">© 2026 Zaira Furnishing</p>
      </div>
    </div>
  );
}
